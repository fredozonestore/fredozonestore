import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import Rating from "@mui/material/Rating";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import { useForm } from "react-hook-form";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import CryptoJS from "crypto-js";
function SingleProduct({ auth, setCountProduct, userId }) {
  const navigate = useNavigate();
  const { id, review } = useParams();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [rating, setRating] = useState(4);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [reviewStatus, setReviewStatus] = useState(false);
  const [reviews, SetReviews] = useState([]);
  const [reviewType, setReviewType] = useState(false);
  const [product, setProduct] = useState({
    title: "Loading...",
    rating: { rate: 0, count: 0 },
    description: "Loading...",
    price: "Loading...",
    image: "",
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const reviewView = async () => {
    try {
      const response = await fetch(`http://localhost:3000/getReview`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ product_id: id }),
      });

      const result = await response.json();
      if (result.error) {
        setIsLoading(false);
        setReviewStatus(false);
      } else {
        if (result.length != 0) {
          setReviewStatus(true);
          SetReviews(result);
          setIsLoading(false);
        } else {
          setIsLoading(false);
          setReviewStatus(false);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const handleSingleProduct = async () => {
      try {
        const response = await fetch(`http://localhost:3000/products/${id}`);

        const result = await response.json();
        if (result.error) {
          setIsLoading(false);
          setProduct(false);
        } else {
          setProduct(result);
          setIsLoading(false);
          reviewView();
        }
      } catch (error) {
        console.error(error);
        setIsLoading(false);
        setProduct(false);
      }
    };
    handleSingleProduct();
  }, [id]);

  const [cart, setCart] = useState(() => {
    const storedCart = localStorage.getItem("cart");
    return storedCart ? JSON.parse(storedCart) : [];
  });
  //add the product to the cart
  if (localStorage.getItem("username") === "love") {
    localStorage.setItem("username", "Guest");
  }
  const username = localStorage.getItem("username");

  const handleSingleAddCart = async (id, userId, title, price, image_url) => {
    if (userId !== "") {
      const productInfo = {
        product_id: id,
        userId: userId,
      };
      try {
        const response = await fetch("http://localhost:3000/cart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(productInfo),
        });

        const result = await response.json();

        if (result.message === "Data inserted successfully") {
          const user = {
            userId: userId,
          };
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

          const test = await response.json();
          setCountProduct(test[0].total_amount);
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      setCart((prevItems) => {
        const productFound = prevItems.find((product) => {
          return product.product_id === id && product.username === "Guest";
        });

        if (productFound) {
          return prevItems.map((cart) =>
            cart.product_id === id ? { ...cart, amount: cart.amount + 1 } : cart
          );
        } else {
          return [
            ...prevItems,
            {
              product_id: id,
              amount: 1,
              username: username,
              title: title,
              price: price,
              image_url: image_url,
            },
          ];
        }
      });
      // setCountProduct(cart.length);
    }
  };

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  //update the icon cart
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

  //loader
  const [isLoading, setIsLoading] = useState(true);

  const onSubmit = async () => {
    try {
      const productReview = {
        product_id: id,
        userId: userId,
        title: title,
        description: description,
        rating: rating,
      };
      const response = await fetch(`http://localhost:3000/addReview`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productReview),
      });

      const result = await response.json();
      if (result.message === "Data inserted successfully") {
        const messageReview = `Your review has been successfully created!`;
        const messageTypeReview = "success";
        navigate("/orderhistory", {
          state: { messageReview, messageTypeReview },
        });
      } else {
        setMessage(
          "Sorry, we encountered an issue while submitting your review. Please try again later."
        );
        setMessageType("error");
      }
    } catch (error) {
      console.error(error);
    }
  };

  //delete message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 5000);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [message]);

  const originalValue = "true";
  const originalHash = CryptoJS.SHA256(originalValue).toString();
  useEffect(() => {
    if (review === originalHash) {
      setReviewType(true);
    } else {
      setReviewType(false);
    }
  }, [review]);
  return (
    <>
      {isLoading ? (
        <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={isLoading}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      ) : (
        <>
          <div className="alertStyleBox">
            {message && (
              <Stack sx={{ width: "100%" }} spacing={2}>
                <Alert severity={messageType}>{message}</Alert>
              </Stack>
            )}
          </div>
          {product ? (
            product.map((product) => (
              <div key={product.product_id}>
                <Box className="conatinerSingleProduct">
                  <Card className="singleCardProduct">
                    <div className="imgDescription">
                      <Box className="imagenSingleProduct">
                        <CardMedia
                          component="img"
                          image={product.image_url}
                          className="imagenSingle"
                        ></CardMedia>
                      </Box>
                      <Box
                        sx={{ display: "flex", flexDirection: "column" }}
                        className="singleProductInfo"
                      >
                        <Typography
                          component="div"
                          variant="p"
                          className="categorySingleProduct"
                        >
                          {product.category}
                        </Typography>
                        <Typography
                          variant="h5"
                          component="div"
                          className="titleSingleProductCart"
                        >
                          {product.title}
                        </Typography>
                        <Typography variant="body2" component="div">
                          <div className="ratingProduct">
                            {product.rating && (
                              <>
                                <Rating
                                  name="read-only"
                                  value={product.rate}
                                  precision={0.5}
                                  size="small"
                                  readOnly
                                />
                                <span className="blue-style">
                                  ({product.count})
                                </span>
                              </>
                            )}
                          </div>
                        </Typography>
                        <hr width="100%" />
                        <Typography
                          variant="h6"
                          component="div"
                          className="priceSingleProduct"
                        >
                          ${product.price}
                        </Typography>
                        <hr width="100%" />
                        <Typography
                          component="div"
                          sx={{
                            fontFamily: "UbuntuNerdFont-bold",
                            fontSize: "1.1rem",
                          }}
                        >
                          About this item
                        </Typography>
                        <Typography component="div">
                          {product.description}
                        </Typography>
                        {review !== "true" &&
                          product.title !== "Loading..." && (
                            <Link
                              onClick={() =>
                                handleSingleAddCart(
                                  product.product_id,
                                  userId,
                                  product.title,
                                  product.price,
                                  product.image_url,
                                  product.category
                                )
                              }
                              className="button buttonAddCart"
                            >
                              <ShoppingCartOutlinedIcon
                                sx={{ fontSize: "1.3rem" }}
                              />
                              Add to cart
                            </Link>
                          )}
                      </Box>
                    </div>
                    {reviewType === true ? (
                      <Box sx={{ width: "100%" }} key="WriteRevie">
                        <Grid
                          container
                          rowSpacing={1}
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            marginTop: "50px",
                          }}
                        >
                          <Grid
                            item
                            xs={12}
                            md={12}
                            lg={12}
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "flex-start",
                              minWidth: { xs: "100%", md: "50%", lg: "30%" },
                            }}
                          >
                            <Grid
                              container
                              sx={{ padding: { xs: "10px", md: "0", lg: "0" } }}
                            >
                              <Box
                                component="form"
                                noValidate
                                autoComplete="off"
                                key="formRegister"
                                sx={{
                                  minWidth: "100%",
                                }}
                                onSubmit={handleSubmit(onSubmit)}
                              >
                                <Grid item xs={12} md={12} lg={12}>
                                  How would you rate it?
                                </Grid>
                                <Grid item xs={12} md={12} lg={12}>
                                  <Rating
                                    name="no-value"
                                    value={rating}
                                    onChange={(e) =>
                                      setRating(Number(e.target.value))
                                    }
                                  />
                                </Grid>
                                <Grid item xs={12} md={12} lg={12}>
                                  <label>Title your review:</label>
                                  <TextField
                                    error={!!errors.title}
                                    id={
                                      errors.title
                                        ? "outlined-error-helper-text-name"
                                        : "outlined-basic-name"
                                    }
                                    {...register("title", {
                                      required: "This is required.",
                                      minLength: {
                                        value: 4,
                                        message: "Min Lengt is 4",
                                      },
                                      maxLength: {
                                        value: 20,
                                        message: "Max Lengt is 20",
                                      },
                                      pattern: {
                                        value: /^[A-Za-z\s]+$/,
                                        message:
                                          "Entered value does not match the allowed format.",
                                      },
                                    })}
                                    variant="outlined"
                                    key="title"
                                    onChange={(e) => setTitle(e.target.value)}
                                    helperText={errors.title?.message}
                                    required
                                    fullWidth
                                  />
                                </Grid>
                                <Grid item xs={12} md={12} lg={12}>
                                  <label>Description:</label>
                                  <br />
                                  <FormControl sx={{ width: "100%" }}>
                                    <textarea
                                      className={
                                        errors.description?.message
                                          ? "errorTextareaReview textareaReview"
                                          : ` normalTextareaReview textareaReview`
                                      }
                                      value={description}
                                      {...register("description", {
                                        required: "This is required.",
                                        minLength: {
                                          value: 4,
                                          message: "Min Lengt is 4",
                                        },
                                      })}
                                      onChange={(e) =>
                                        setDescription(e.target.value)
                                      }
                                      rows="4"
                                    />
                                    <FormHelperText sx={{ color: "#d32f2f" }}>
                                      {errors.description?.message}
                                    </FormHelperText>
                                  </FormControl>
                                </Grid>
                                <button
                                  type="submit"
                                  className="Button submit"
                                  style={{ width: "100%" }}
                                >
                                  Submit
                                </button>
                              </Box>
                            </Grid>
                          </Grid>
                        </Grid>
                      </Box>
                    ) : (
                      <>
                        <h2 className="customerReviews">Customer reviews</h2>
                        {Array.isArray(reviews) ? (
                          reviewStatus == true ? (
                            reviews.map((review) => (
                              <div key={review.review_id}>
                                <Grid
                                  sx={{ display: "flex", alignItems: "center" }}
                                >
                                  <AccountCircleIcon />
                                  <span>{review.username}</span>
                                </Grid>
                                <Grid
                                  sx={{ display: "flex", alignItems: "center" }}
                                >
                                  <Rating
                                    name="half-rating-read"
                                    defaultValue={Number(review.rate)}
                                    precision={0.5}
                                    readOnly
                                  />
                                  <span className="bold-text">
                                    {review.title}
                                  </span>
                                </Grid>
                                <Grid
                                  sx={{ display: "flex", alignItems: "center" }}
                                >
                                  Reviewed in the United States on &nbsp;
                                  <span>{review.formatted_date}</span>
                                </Grid>
                                <p>{review.description}</p>
                              </div>
                            ))
                          ) : (
                            <p>No reviews available.</p>
                          )
                        ) : null}
                      </>
                    )}
                  </Card>
                </Box>
              </div>
            ))
          ) : (
            <Box
              className="errorContainerSingleProduct"
              sx={{ minHeight: { xs: "29.2vh", md: "85vh", lg: "85vh" } }}
            >
              <Typography component="div" variant="p" id="sorry">
                SORRY
              </Typography>
              <Typography component="div" variant="p" id="productnotfound">
                we could&apos;n find that product
              </Typography>
              <Typography component="div" variant="p" id="trysearching">
                try searching or go to{" "}
                <Link to="/" id="homePageError">
                  FredZone&apos;s home page
                </Link>
              </Typography>
            </Box>
          )}
        </>
      )}
    </>
  );
}

export default SingleProduct;
