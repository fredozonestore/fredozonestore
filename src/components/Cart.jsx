import react from "react";
import { useState, useEffect } from "react";
import { createTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import Grid from "@mui/material/Grid";
import { Link, useLocation } from "react-router-dom";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
function Cart({ setCountProduct, userId }) {
  const location = useLocation();

  const { thankYou, message, messageTwo } = location.state || {};
  const [cart, setCart] = useState(() => {
    const storedCart = localStorage.getItem("cart");
    return storedCart ? JSON.parse(storedCart) : [];
  });
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const username = localStorage.getItem("username");
  const [cartProducts, setCartProducts] = useState([]);
  const [taxes, setTaxes] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [shipping, setShipping] = useState(7);

  const handleSingleProduct = async () => {
    if (userId !== "") {
      try {
        const response = await fetch("http://localhost:3000/getCart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: userId }),
        });

        const result = await response.json();

        setCartProducts(result);
      } catch (error) {
        console.log(error);
      }
    } else {
      setCartProducts(cart);
    }
  };

  useEffect(() => {
    handleSingleProduct();
  });

  const [empty, setEmpty] = useState("");

  useEffect(() => {
    if (cartProducts) {
      // setEmpty("Your cart is empty");
      setIsLoading(false);
    }
  }, [cartProducts]);

  const handleChange = async (event, productId) => {
    if (userId !== "") {
      let valueAmount = event.target.value;
      const updateCart = {
        amount: valueAmount,
        product_id: productId,
        userId: userId,
      };
      try {
        const response = await fetch("http://localhost:3000/updateCart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateCart),
        });

        const result = await response.json();
        if (result.message === "Data updated successfully") {
          handleSingleProduct();
          updateItemCart();
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      const updatedCart = cart.map((item) =>
        item.product_id === productId && item.username === "Guest"
          ? { ...item, amount: event.target.value }
          : item
      );
      setCart(updatedCart);
    }
  };

  const handleDelete = async (productId) => {
    if (userId !== "") {
      const deleteCart = {
        product_id: productId,
        userId: userId,
      };
      try {
        const response = await fetch("http://localhost:3000/deleteCart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(deleteCart),
        });

        const result = await response.json();
        if (result.message === "Data deleted successfully") {
          handleSingleProduct();
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      const deleteCart = cart.filter(
        (item) => !(item.product_id === productId && item.username === "Guest")
      );
      setCart(deleteCart);
    }
  };

  //update guest to username
  useEffect(() => {
    if (userId === "") {
      if (username !== "Guest") {
        const updateGuest = cart.map((guest) =>
          guest.username === "Guest" ? { ...guest, username: username } : guest
        );
        setCart(updateGuest);
      }
    }
  }, [username]);

  //update the icon cart
  const [total, setTotal] = useState(0);

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
        setTotal(result[0].total_amount);
        setCountProduct(result[0].total_amount);
      } catch (error) {
        console.log(error);
      }
    } else {
      const updateItemCount = cart.reduce((accumulator, item) => {
        if (item.username === "Guest") {
          return accumulator + item.amount;
        }
        return accumulator;
      }, 0);
      setTotal(updateItemCount);
      setCountProduct(updateItemCount);
    }
  };

  useEffect(() => {
    updateItemCart();
  });

  //get the grand total
  const [totalPrice, setTotalPrice] = useState(0);
  useEffect(() => {
    if (userId !== "") {
      const updateItemPrice = cartProducts.map(
        (item) => parseFloat(item.price) * item.amount
      );
      const updateTotalPrice = updateItemPrice.reduce(
        (prev, next) => prev + next,
        0
      );

      setTotalPrice(updateTotalPrice);
      const calculatedTaxes = (updateTotalPrice * 0.06).toFixed(2);
      setTaxes(calculatedTaxes);
    } else {
      const updateItemPrice = cartProducts
        .filter(
          (item) => item.username === username || item.username === "Guest"
        )
        .map((item) => item.price * item.amount);

      const updateTotalPrice = updateItemPrice.reduce(
        (prev, next) => prev + next,
        0
      );

      setTotalPrice(updateTotalPrice);
      const calculatedTaxes = (updateTotalPrice * 0.06).toFixed(2);
      setTaxes(calculatedTaxes);
    }
  }, [cartProducts, totalPrice, username]);

  return (
    <div className="containerPage" style={{ minHeight: "78.2vh" }}>
      {isLoading ? (
        <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={isLoading}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      ) : (
        <>
          <Box className="cartContainer">
            <h1 className="shoppingCart">Shopping Cart</h1>
            {userId !== "" ? (
              <Link to="/orderhistory" className="orderHistoryButton">
                Your Orders
              </Link>
            ) : null}

            <Box className="cartContainerColumn">
              <Grid
                container
                direction="column"
                justifyContent="center"
                alignItems="center"
              >
                <Box className="containerCartList">
                  {cartProducts.length > 0 ? (
                    cartProducts.map((product) => (
                      <Grid
                        item
                        xs={12}
                        md={12}
                        lg={12}
                        key={product.product_id}
                        className="sizeContainerCard"
                      >
                        <Card className="cardProduct">
                          <Box className="imagenSingleProductOrderHistory">
                            <CardMedia
                              component="img"
                              image={product.image_url}
                              className="imagenCart"
                            ></CardMedia>
                          </Box>
                          <Box
                            sx={{ display: "flex", flexDirection: "column" }}
                            className="cartProductInfo"
                          >
                            <Typography
                              component="div"
                              variant="p"
                              className="categorySingleProduct"
                            >
                              {product.category}
                            </Typography>
                            <Link
                              to={`/product/${product.product_id}`}
                              className="linkCartProduct"
                            >
                              <Typography
                                variant="p"
                                component="div"
                                className="titleSingleProduct"
                              >
                                {product.title}
                              </Typography>
                            </Link>
                            <Typography
                              variant="p"
                              component="div"
                              className="cartSingleProduct"
                            >
                              ${product.price}
                            </Typography>
                            <Typography
                              variant="p"
                              component="div"
                              className="priceSingleProduct"
                            >
                              <FormControl
                                variant="standard"
                                sx={{ m: 1, minWidth: 120 }}
                              >
                                <InputLabel id="demo-simple-select-standard-label">
                                  Quantity
                                </InputLabel>
                                <Select
                                  labelId="demo-simple-select-standard-label"
                                  id="demo-simple-select-standard"
                                  value={product.amount}
                                  onChange={(event) =>
                                    handleChange(event, product.product_id)
                                  }
                                  label="Quantity"
                                >
                                  {Array.from(
                                    {
                                      length:
                                        product.amount < 10
                                          ? 10
                                          : product.amount + 3,
                                    },
                                    (_, index) => (
                                      <MenuItem
                                        key={index + 1}
                                        value={index + 1}
                                      >
                                        {index + 1}
                                      </MenuItem>
                                    )
                                  )}
                                </Select>
                              </FormControl>
                            </Typography>
                            <Tooltip title="Delete" placement="right">
                              <IconButton
                                sx={{ width: "40px", height: "40px" }}
                                onClick={() => handleDelete(product.product_id)}
                              >
                                <DeleteOutlineIcon className="deleteProduct" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Card>
                      </Grid>
                    ))
                  ) : cartProducts.length === 0 ? (
                    thankYou !== "THANK YOU!" ? (
                      <>
                        <p>No products in the cart.</p>
                      </>
                    ) : (
                      <>
                        <div
                          className={
                            thankYou === "THANK YOU!" ? "tankYouShopping" : ""
                          }
                        >
                          <h1>{thankYou}</h1>
                          <p>{message}</p>
                          <p>{messageTwo}</p>
                        </div>
                      </>
                    )
                  ) : (
                    <p>No products in the cart.</p>
                  )}
                </Box>
              </Grid>
              {cartProducts.length !== 0 ? (
                <Box className="subtotal">
                  <Grid container className="containerSubtotalCart">
                    <Grid
                      item
                      xs={12}
                      md={12}
                      lg={12}
                      className="containerSubtotalCart"
                    >
                      <Typography
                        variant="p"
                        component="div"
                        sx={{
                          fontFamily: "UbuntuNerdFont-bold",
                          fontSize: "1.4rem",
                        }}
                      >
                        Summary
                      </Typography>
                      <div className="cartSubtotal">
                        <Typography
                          variant="p"
                          component="div"
                          className="totalInfo"
                        >
                          Subtotal ({total}
                          {total > 1 ? " Items" : " Item"}) :
                        </Typography>
                        <Typography
                          variant="p"
                          component="div"
                          className="amount"
                        >
                          ${totalPrice.toFixed(2)}
                        </Typography>
                      </div>
                      <div className="cartSubtotal">
                        <Typography
                          variant="p"
                          component="div"
                          className="totalInfo"
                        >
                          Estimated Shipping & Handling
                        </Typography>
                        <Typography
                          variant="p"
                          component="div"
                          className="amount"
                        >
                          ${shipping.toFixed(2)}
                        </Typography>
                      </div>
                      <div className="cartSubtotal">
                        <Typography
                          variant="p"
                          component="div"
                          className="totalInfo"
                        >
                          Estimated Tax{" "}
                        </Typography>
                        <Typography
                          variant="p"
                          component="div"
                          className="amount"
                        >
                          ${taxes}
                        </Typography>
                      </div>

                      <hr />
                      <div className="cartSubtotal">
                        <Typography
                          variant="p"
                          component="div"
                          className="totalInfo"
                        >
                          Total:
                        </Typography>
                        <Typography
                          variant="p"
                          component="div"
                          className="amount"
                          sx={{
                            fontFamily: "UbuntuNerdFont-bold",
                            marginBottom: "5px",
                          }}
                        >
                          $
                          {(
                            parseFloat(totalPrice) +
                            shipping +
                            parseFloat(taxes)
                          ).toFixed(2)}
                        </Typography>
                      </div>
                      <hr />
                      <Link
                        to={`/checkout`}
                        className={`button buttonAddCart checkoutCart ${
                          total !== 0 ? "" : "disabled"
                        }`}
                      >
                        Proceed to Checkout
                      </Link>
                    </Grid>
                  </Grid>
                </Box>
              ) : null}
            </Box>
          </Box>
        </>
      )}
    </div>
  );
}

export default Cart;
