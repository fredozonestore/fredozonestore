import react from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import TextField from "@mui/material/TextField";
import AppleIcon from "@mui/icons-material/Apple";
import { useForm } from "react-hook-form";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import FormHelperText from "@mui/material/FormHelperText";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
function Checkout({ setCountProduct, userId, auth, token }) {
  const navigate = useNavigate();
  const stateName = [
    "AL",
    "AK",
    "AZ",
    "AR",
    "CA",
    "CO",
    "CT",
    "DE",
    "FL",
    "GA",
    "HI",
    "ID",
    "IL",
    "IN",
    "IA",
    "KS",
    "KY",
    "LA",
    "ME",
    "MD",
    "MA",
    "MI",
    "MN",
    "MS",
    "MO",
    "MT",
    "NE",
    "NV",
    "NH",
    "NJ",
    "NM",
    "NY",
    "NC",
    "ND",
    "OH",
    "OK",
    "OR",
    "PA",
    "RI",
    "SC",
    "SD",
    "TN",
    "TX",
    "UT",
    "VT",
    "VA",
    "WA",
    "WV",
    "WI",
    "WY",
  ];
  const [cartProducts, setCartProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const username = localStorage.getItem("username");
  const [total, setTotal] = useState(0);
  const [taxes, setTaxes] = useState(0);
  const [shipping, setShipping] = useState(7);
  const [totalPrice, setTotalPrice] = useState(0);
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState(stateName[0]);
  const [zipcode, setZipcode] = useState("");
  const [email, setEmail] = useState("");
  const [errorEmail, setErrorEmail] = useState("");
  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [productDb, setProductDb] = useState([]);

  const [cart, setCart] = useState(() => {
    const storedCart = localStorage.getItem("cart");
    return storedCart ? JSON.parse(storedCart) : [];
  });
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      street: "",
      city: "",
      state: state,
      zipcode: "",
    },
  });

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
  }, [cartProducts, username, userId]);

  //get the grand total
  useEffect(() => {
    if (userId !== "") {
      const updateItemPrice = cartProducts.map(
        (item) => parseFloat(item.price) * item.amount
      );
      const updateTotalPrice = updateItemPrice.reduce(
        (prev, next) => prev + next,
        0
      );

      const calculatedTaxes = (updateTotalPrice * 0.06).toFixed(2);
      setTaxes(calculatedTaxes);
      setTotalPrice(updateTotalPrice);
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

      const calculatedTaxes = parseFloat((updateTotalPrice * 0.06).toFixed(2));
      setTaxes(calculatedTaxes);
      setTotalPrice(updateTotalPrice);
    }
  }, [cartProducts, username, userId]);

  const [valueAddress, setValueAddress] = useState("");
  //get address from DB
  const [addressDB, setAddressDB] = useState([]);
  useEffect(() => {
    const handleAddress = async () => {
      if (userId !== "") {
        try {
          const response = await fetch("http://localhost:3000/getAddress", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId: userId }),
          });

          const result = await response.json();
          if (result.length > 0) {
            setValueAddress(result[0].address_id);
          }
          setAddressDB(result);
        } catch (error) {
          console.log(error);
        }
      }
    };
    handleAddress(); // This will run when the component mounts
  }, [userId]); // Specify userId as a dependency

  const [empty, setEmpty] = useState("");

  useEffect(() => {
    if (cartProducts) {
      setEmpty("Your cart is empty");
      setIsLoading(false);
    }
  }, [cartProducts]);

  useEffect(() => {
    const countAmount = cartProducts.reduce((prev, curr) => {
      return prev + curr.amount;
    }, 0);
    setTotal(countAmount);
  });

  // const handleChangeState = (event) => {
  //   console.log(event.target.value);
  //   setState(event.target.value);
  // };

  //hanflechange address

  const handleAdressDB = (event) => {
    setValueAddress(event.target.value);
  };

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
        if (item.username === username || item.username === "Guest") {
          return accumulator + item.amount;
        }
        return accumulator;
      }, 0);
      setCountProduct(updateItemCount);
    }
  };

  useEffect(() => {
    updateItemCart();
  });

  //adding the informatio to add it inside the db
  useEffect(() => {
    const updatedCartProducts = cartProducts.map((item) => ({
      product_id: item.product_id,
      amount: item.amount,
      price: item.price,
    }));

    setProductDb(updatedCartProducts);
  }, [cartProducts]);

  const onSubmit = async () => {
    if (userId !== "") {
      try {
        let address = "";
        if (token !== "") {
          address = valueAddress;
        }
        const requestBody = {
          productDb: productDb,
          userId: userId,
          totalPrice: parseFloat(totalPrice),
          taxes: parseFloat(taxes),
          GrandTotalArray: (
            parseFloat(totalPrice) +
            parseFloat(taxes) +
            parseFloat(shipping)
          ).toFixed(2),
          address: address,
        };
        const response = await fetch("http://localhost:3000/checkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        if (result.message === "Data updated successfully") {
          const deleteCart = {
            userId: userId,
          };
          try {
            const response = await fetch(
              "http://localhost:3000/deleteCartAfterCheckout",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(deleteCart),
              }
            );

            const result = await response.json();
            console.log(result);
            if (result.message === "Data deleted successfully") {
              setCountProduct("");
              const thankYou = "THANK YOU!";
              const message = `we are getting started on your order right away.`;
              const messageTwo =
                "and you will receive an order confirmation email soon.";
              navigate("/cart", { state: { thankYou, message, messageTwo } });
            }
          } catch (error) {
            console.log(error);
          }
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      try {
        const requestBody = {
          productDb: productDb,
          userId: userId || "",
          totalPrice: parseFloat(totalPrice),
          taxes: parseFloat(taxes),
          GrandTotalArray: (
            parseFloat(totalPrice) +
            parseFloat(taxes) +
            parseFloat(shipping)
          ).toFixed(2),
          firstName: name,
          lastName: lastname,
          street: street,
          city: city,
          state: state,
          zipcode: zipcode,
          email: email,
        };
        const response = await fetch(
          "http://localhost:3000/checkoutNewAddress",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        if (result.message === "Data updated successfully") {
          localStorage.removeItem("cart");
          setCountProduct("");
          const thankYou = "THANK YOU!";
          const message = `we are getting started on your order right away.`;
          const messageTwo =
            "and you will receive an order confirmation email soon.";
          navigate("/cart", { state: { thankYou, message, messageTwo } });
        }
        console.log(result);
      } catch (error) {
        console.log(error);
      }
    }
  };

  return (
    <>
      <Box className="cartContainer">
        <h1 className="shoppingCart">Checkout</h1>
        {cartProducts.length == 0 ? <>{empty}</> : null}
        <Box className="checkoutContainerColumn">
          <Grid
            container
            direction="column"
            justifyContent="center"
            alignItems="center"
          >
            <Box className="containerCheckoutList">
              <div className="expressCheckout">
                <h3 className="titleExpress">Expresss Checkout</h3>
                <div className="quickpay">
                  <div className="payButton applePay">
                    <span className="logo">
                      <AppleIcon sx={{ fill: "white" }} />
                      Pay
                    </span>
                  </div>
                  <div className="payButton googlePay">
                    <span className="logo">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 48 48"
                        width="20px"
                        height="20px"
                      >
                        <path
                          fill="#fbc02d"
                          d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12	s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20	s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                        />
                        <path
                          fill="#e53935"
                          d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039	l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                        />
                        <path
                          fill="#4caf50"
                          d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36	c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                        />
                        <path
                          fill="#1565c0"
                          d="M43.611,20.083L43.595,20L42,20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571	c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                        />
                      </svg>
                      Pay
                    </span>
                  </div>
                  <div className="payButton PaypalPay">
                    <span className="logo">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 48 48"
                        width="20px"
                        height="20px"
                      >
                        <path
                          fill="#1565C0"
                          d="M18.7,13.767l0.005,0.002C18.809,13.326,19.187,13,19.66,13h13.472c0.017,0,0.034-0.007,0.051-0.006C32.896,8.215,28.887,6,25.35,6H11.878c-0.474,0-0.852,0.335-0.955,0.777l-0.005-0.002L5.029,33.813l0.013,0.001c-0.014,0.064-0.039,0.125-0.039,0.194c0,0.553,0.447,0.991,1,0.991h8.071L18.7,13.767z"
                        />
                        <path
                          fill="#039BE5"
                          d="M33.183,12.994c0.053,0.876-0.005,1.829-0.229,2.882c-1.281,5.995-5.912,9.115-11.635,9.115c0,0-3.47,0-4.313,0c-0.521,0-0.767,0.306-0.88,0.54l-1.74,8.049l-0.305,1.429h-0.006l-1.263,5.796l0.013,0.001c-0.014,0.064-0.039,0.125-0.039,0.194c0,0.553,0.447,1,1,1h7.333l0.013-0.01c0.472-0.007,0.847-0.344,0.945-0.788l0.018-0.015l1.812-8.416c0,0,0.126-0.803,0.97-0.803s4.178,0,4.178,0c5.723,0,10.401-3.106,11.683-9.102C42.18,16.106,37.358,13.019,33.183,12.994z"
                        />
                        <path
                          fill="#283593"
                          d="M19.66,13c-0.474,0-0.852,0.326-0.955,0.769L18.7,13.767l-2.575,11.765c0.113-0.234,0.359-0.54,0.88-0.54c0.844,0,4.235,0,4.235,0c5.723,0,10.432-3.12,11.713-9.115c0.225-1.053,0.282-2.006,0.229-2.882C33.166,12.993,33.148,13,33.132,13H19.66z"
                        />
                      </svg>
                      <span style={{ color: "#283593", fontWeight: "700" }}>
                        Pay
                        <span style={{ color: "#1565C0", fontWeight: "700" }}>
                          Pal
                        </span>
                      </span>
                    </span>
                  </div>
                </div>
              </div>
              <Grid
                container
                sx={{ width: { xs: "347px", md: "600px", lg: "600px" } }}
              >
                <Grid item xs={12} md={12} lg={12}>
                  <Grid
                    sx={{
                      marginLeft: "10px",
                      marginBottom: "15px",
                      marginTop: "15px",
                    }}
                  >
                    Add Card
                  </Grid>
                </Grid>
                <Grid container spacing={1}>
                  <Grid item xs={12} md={4} lg={4}>
                    <TextField
                      id="outlined-basic"
                      label="Card Number"
                      variant="outlined"
                      fullWidth
                      sx={{
                        m: 1,
                        width: { xs: "95%", md: "100%", lg: "100%" },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4} lg={4}>
                    <TextField
                      id="outlined-basic"
                      label="MM/YY"
                      variant="outlined"
                      fullWidth
                      sx={{
                        m: 1,
                        width: { xs: "95%", md: "100%", lg: "100%" },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4} lg={4}>
                    <TextField
                      id="outlined-basic"
                      label="CVV"
                      variant="outlined"
                      fullWidth
                      sx={{
                        m: 1,
                        width: { xs: "95%", md: "100%", lg: "100%" },
                      }}
                    />
                  </Grid>
                </Grid>
                <Grid
                  sx={{
                    marginLeft: "10px",
                    marginBottom: "15px",
                    marginTop: "15px",
                  }}
                >
                  Shipping Address
                </Grid>
                <Box
                  component="form"
                  noValidate
                  autoComplete="off"
                  key="formRegister"
                  onSubmit={handleSubmit(onSubmit)}
                  sx={{ minWidth: "100%" }}
                >
                  {userId !== "" ? (
                    <FormControl sx={{ minWidth: "inherit" }}>
                      <RadioGroup
                        aria-labelledby="demo-radio-buttons-group-label"
                        name="radio-buttons-group"
                        onChange={handleAdressDB}
                        value={valueAddress}
                      >
                        {addressDB.map((address) => (
                          <div
                            key={address.address_id}
                            className="radioStyleAddress"
                          >
                            <FormControlLabel
                              sx={{ paddingLeft: "10px", minWidth: "100%" }}
                              value={address.address_id}
                              control={<Radio />}
                              label={
                                <div
                                  className="nameAdddressStyle"
                                  style={{ maxWidth: "100%" }}
                                >
                                  <span className="bold-text">
                                    {address.name}
                                  </span>
                                  <span className="normal-text">
                                    {address.address},&nbsp;{address.city}
                                    ,&nbsp;
                                    {address.state},&nbsp;{address.zipcode}
                                  </span>
                                </div>
                              }
                            />
                          </div>
                        ))}
                      </RadioGroup>
                    </FormControl>
                  ) : (
                    <>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6} lg={6}>
                          <TextField
                            error={!!errors.name}
                            id={
                              errors.name
                                ? "outlined-error-helper-text-name"
                                : "outlined-basic-name"
                            }
                            {...register("name", {
                              required: "This is required.",
                              minLength: {
                                value: 4,
                                message: "Min Lengt is 4",
                              },
                              maxLength: {
                                value: 9,
                                message: "Max Lengt is 9",
                              },
                              pattern: {
                                value: /^[A-Za-z\s]+$/,
                                message:
                                  "Entered value does not match the allowed format.",
                              },
                            })}
                            label="First Name"
                            variant="outlined"
                            key="name"
                            onChange={(e) => setName(e.target.value)}
                            helperText={errors.name?.message}
                            required
                            fullWidth
                            sx={{
                              m: 1,
                              width: { xs: "95%", md: "100%", lg: "100%" },
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} md={6} lg={6}>
                          <TextField
                            error={!!errors.lastname}
                            id={
                              errors.lastname
                                ? "outlined-error-helper-text-lastname"
                                : "outlined-basic-lastname"
                            }
                            {...register("lastname", {
                              required: "This is required.",
                              minLength: {
                                value: 4,
                                message: "Min Lengt is 4",
                              },
                              maxLength: {
                                value: 15,
                                message: "Max Lengt is 15",
                              },
                              pattern: {
                                value: /^[A-Za-z\s]+$/,
                                message:
                                  "Entered value does not match the allowed format.",
                              },
                            })}
                            label="Last Name"
                            variant="outlined"
                            key="lastname"
                            inputProps={{}}
                            onChange={(e) => setLastname(e.target.value)}
                            helperText={errors.lastname?.message}
                            required
                            fullWidth
                            sx={{
                              m: 1,
                              width: { xs: "95%", md: "100%", lg: "100%" },
                            }}
                          />
                        </Grid>
                      </Grid>
                      <Grid item xs={12} md={12} lg={12}>
                        <TextField
                          error={!!errors.email}
                          id={
                            errors.email
                              ? "outlined-error-helper-text-email"
                              : "outlined-basic-email"
                          }
                          {...register("email", {
                            required: "This is required.",
                            pattern: {
                              value: /\S+@\S+\.\S+/,
                              message:
                                "Entered value does not match email format",
                            },
                          })}
                          label="Email"
                          variant="outlined"
                          key="email"
                          onChange={(e) => setEmail(e.target.value)}
                          helperText={errors.email?.message}
                          required
                          fullWidth
                          sx={{
                            m: 1,
                            width: { xs: "95%", md: "100%", lg: "100%" },
                          }}
                        />
                        {errorEmail && (
                          <p style={{ color: "red" }}>{errorEmail}</p>
                        )}
                      </Grid>
                      <Grid item xs={12} md={12} lg={12}>
                        <TextField
                          error={!!errors.street}
                          id={
                            errors.street
                              ? "outlined-error-helper-text-street"
                              : "outlined-basic-street"
                          }
                          {...register("street", {
                            required: "This is required.",
                            minLength: {
                              value: 4,
                              message: "Min Lengt is 4",
                            },
                            pattern: {
                              value: /^[A-Za-z0-9\s]+$/,
                              message:
                                "Entered value does not match the allowed format.",
                            },
                          })}
                          label="Street"
                          variant="outlined"
                          key="street"
                          onChange={(e) => setStreet(e.target.value)}
                          helperText={errors.street?.message}
                          required
                          fullWidth
                          sx={{
                            m: 1,
                            width: { xs: "95%", md: "100%", lg: "100%" },
                          }}
                        />
                      </Grid>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={4} lg={4}>
                          <TextField
                            error={!!errors.city}
                            id={
                              errors.city
                                ? "outlined-error-helper-text-city"
                                : "outlined-basic-city"
                            }
                            {...register("city", {
                              required: "This is required.",
                              minLength: {
                                value: 2,
                                message: "Min Lengt is 2",
                              },
                            })}
                            label="City"
                            variant="outlined"
                            key="city"
                            onChange={(e) => setCity(e.target.value)}
                            helperText={errors.city?.message}
                            required
                            sx={{
                              m: 1,
                              width: { xs: "95%", md: "100%", lg: "100%" },
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} md={4} lg={4}>
                          <FormControl
                            fullWidth
                            sx={{
                              m: 1,
                              width: { xs: "95%", md: "100%", lg: "100%" },
                            }}
                          >
                            <InputLabel
                              id={
                                errors.state
                                  ? "outlined-error-demo-simple-select-label"
                                  : "demo-simple-select"
                              }
                              {...register("state", {
                                required: "This is required.",
                              })}
                            >
                              State
                            </InputLabel>
                            <Select
                              error={!!errors.state}
                              id={
                                errors.state
                                  ? "outlined-error-demo-simple-select-label"
                                  : "demo-simple-select"
                              }
                              labelId="demo-simple-select-label"
                              value={state}
                              label="state"
                              onChange={(e) => {
                                console.log("Selected value:", e.target.value);
                                setState(e.target.value);
                              }}
                            >
                              {stateName.map((state, index) => (
                                <MenuItem key={index + 1} value={state}>
                                  {state}
                                </MenuItem>
                              ))}
                            </Select>
                            <FormHelperText sx={{ color: "#d32f2f" }}>
                              {errors.state?.message}
                            </FormHelperText>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} md={4} lg={4}>
                          <TextField
                            error={!!errors.zipcode}
                            id={
                              errors.zipcode
                                ? "outlined-error-helper-text-zipcode"
                                : "outlined-basic-zipcode"
                            }
                            {...register("zipcode", {
                              required: "This is required.",
                              minLength: {
                                value: 4,
                                message: "Min Lengt is 4",
                              },
                              pattern: {
                                value: /^\d{5}$/,
                                message:
                                  "Please enter a valid 5-digit Zip Code",
                              },
                            })}
                            sx={{
                              m: 1,
                              width: { xs: "95%", md: "100%", lg: "100%" },
                            }}
                            label="Zipcode"
                            variant="outlined"
                            key="zipcode"
                            onChange={(e) => setZipcode(e.target.value)}
                            helperText={errors.zipcode?.message}
                            required
                          />
                        </Grid>
                      </Grid>
                    </>
                  )}

                  <Grid item xs={12} md={12} lg={12}>
                    <button
                      type="submit"
                      className="button buttonAddCart checkoutCart"
                      style={{ border: "0px", cursor: "pointer" }}
                    >
                      Checkout
                    </button>
                  </Grid>
                </Box>
              </Grid>
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
                    In your Cart
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
                    <Typography variant="p" component="div" className="amount">
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
                    <Typography variant="p" component="div" className="amount">
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
                    <Typography variant="p" component="div" className="amount">
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
                            ></Typography>
                            <Typography
                              variant="p"
                              component="div"
                              className="cartSingleProduct"
                            >
                              Qty: {product.amount} @ ${product.price}
                            </Typography>
                          </Box>
                        </Card>
                      </Grid>
                    ))
                  ) : (
                    <p>No products in the cart.</p>
                  )}
                </Grid>
              </Grid>
            </Box>
          ) : null}
        </Box>
      </Box>
    </>
  );
}

export default Checkout;
