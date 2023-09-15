import { useState, useEffect } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";

import Cart from "./components/Cart";
import Checkout from "./components/Checkout";
import Login from "./components/Login";
import Logout from "./components/Logout";
import Navbar from "./components/Navbar";
import Footer from "./components/footer";
import Products from "./components/Products";
import Register from "./components/Register";
import "./App.css";
import SingleProduct from "./components/SingleProduct";
import OrderHistory from "./components/OrderHistory";
function App() {
  const Navigate = useNavigate();
  const [token, setToken] = useState("");
  const [auth, setAuth] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [countProduct, setCountProduct] = useState(0);
  const [userId, setUserId] = useState("");
  const [login, setLogin] = useState(false);

  let username = "";
  if (localStorage.getItem("username") === null) {
    username = localStorage.setItem("username", "love");
  } else {
    username = localStorage.getItem("username");
  }

  if (token) {
    localStorage.setItem("token", token);
  }

  if (userId) {
    localStorage.setItem("id", userId);
  }

  //updating the count of the icon cart
  // const [total, setTotal] = useState(0);
  const [cart, setCart] = useState("");
  useEffect(() => {
    // Obtener datos del carrito desde el localStorage
    const storedCart = localStorage.getItem("cart");
    const initialCartState = storedCart ? JSON.parse(storedCart) : [];

    // Inicializar el estado cart con los datos del carrito
    setCart(initialCartState);

    if (userId !== "") {
      handleChangeGuest();
    }
  }, [auth, username]);
  //authentication
  useEffect(() => {
    if (
      localStorage.getItem("token") !== "" &&
      localStorage.getItem("token") !== null
    ) {
      let TokenItem = localStorage.getItem("token");
      setToken(TokenItem);
      setAuth(true);
      let UserId = localStorage.getItem("id");
      setUserId(UserId);
    } else {
      setAuth(false);
    }
  }, [setToken, token]);

  // update the icon cart
  const updateItemCart = async () => {
    if (userId !== "") {
      const user = {
        userId: userId,
      };
      try {
        const response = await fetch(
          "http://localhost:3000/getCartItemAmount",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(user),
          }
        );

        const result = await response.json();
        setCountProduct(result[0].total_amount);
      } catch (error) {
        console.log(error);
      }
    } else {
      // Verifica que cart sea un arreglo antes de usar reduce
      if (Array.isArray(cart) && username === "love") {
        const updateItemCount = cart.reduce((accumulator, item) => {
          if (item.username === "love") {
            return accumulator + item.amount;
          }
          return accumulator;
        }, 0);
        setCountProduct(updateItemCount);
      }
    }
  };

  useEffect(() => {
    updateItemCart();
  });

  //update guest to user
  const handleChangeGuest = async () => {
    try {
      const fetchPromise = cart.map(async (item) => {
        const productInfo = {
          product_id: item.product_id,
          userId: parseInt(userId),
          countQ: item.amount,
        };
        const response = await fetch("http://localhost:3000/addGuestToUser", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(productInfo),
        });
        await response.json();
      });

      await Promise.all(fetchPromise);
      localStorage.removeItem("cart");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Navbar
        auth={auth}
        countProduct={countProduct}
        setSearchInput={setSearchInput}
      />
      <Routes>
        <Route
          path="/"
          element={
            <Products
              searchInput={searchInput}
              userId={userId}
              setCountProduct={setCountProduct}
            />
          }
        ></Route>
        <Route
          path="/login"
          element={
            <Login
              setToken={setToken}
              setUserId={setUserId}
              setLogin={setLogin}
            />
          }
        ></Route>
        <Route path="/register" element={<Register />}></Route>
        <Route
          path="/cart"
          element={<Cart setCountProduct={setCountProduct} userId={userId} />}
        ></Route>
        <Route
          path="/checkout"
          element={
            <Checkout
              userId={userId}
              auth={auth}
              token={token}
              setCountProduct={setCountProduct}
            />
          }
        ></Route>
        <Route
          path="/logout"
          element={
            <Logout
              setToken={setToken}
              setAuth={setAuth}
              setCountProduct={setCountProduct}
              setUserId={setUserId}
            />
          }
        ></Route>
        <Route
          path="/:category?"
          element={<Products searchInput={searchInput} />}
        ></Route>
        <Route
          path="/product/:id/:review?"
          element={
            <SingleProduct
              auth={auth}
              setCountProduct={setCountProduct}
              userId={userId}
            />
          }
        ></Route>
        <Route
          path="/orderhistory"
          element={<OrderHistory userId={userId} />}
        ></Route>
        <Route
          path="*"
          element={<Navigate to="/" />} // Redirect to the home page
        />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
