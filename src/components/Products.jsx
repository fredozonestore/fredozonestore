import react from "react";
import { useEffect, useState, Fragment } from "react";
import Rating from "@mui/material/Rating";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { CardActionArea } from "@mui/material";
import Grid from "@mui/material/Grid";
import { Link } from "react-router-dom";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import { useParams } from "react-router-dom";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Input from "@mui/material/Input";
import InputAdornment from "@mui/material/InputAdornment";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import Alert from "@mui/material/Alert";

// sort icon
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import TuneIcon from "@mui/icons-material/Tune";
function Products({ searchInput, userId, setCountProduct }) {
  const { category } = useParams();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const username = localStorage.getItem("username");
  const [originalItems, setOriginalItems] = useState([]);
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);

      try {
        let encodedCategory = category;
        let categoryName = "";
        if (category) {
          encodedCategory = encodeURIComponent(category);
          categoryName = `/categories/${encodedCategory}`;
        } else {
          categoryName = "";
        }
        const response = await fetch(
          `http://localhost:3000/products${categoryName}`
        );
        const results = await response.json();
        if (results.length !== 0) {
          setOriginalItems(results);
          setItems(results);
        } else {
          setItems(false);
          setOriginalItems(false);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [category]);

  const [cart, setCart] = useState(() => {
    const storedCart = localStorage.getItem("cart");
    return storedCart ? JSON.parse(storedCart) : [];
  });

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

  const [isAscending, setIsAscending] = useState(true);
  //srotting
  const sortByPrice = () => {
    setItems((prevItems) => {
      const ascending = !isAscending;
      const sortedItems = [...prevItems].sort((productA, productB) => {
        if (ascending) {
          return productA.price - productB.price;
        } else {
          return productB.price - productA.price;
        }
      });
      setIsAscending(ascending);
      return sortedItems;
    });
  };

  const [sortTitle, setSortTitle] = useState(true);

  const sortByTitle = () => {
    setItems((prevItems) => {
      const ascending = !sortTitle;
      const sortedProducts = [...prevItems].sort((a, b) => {
        const titleA = a.title.toUpperCase();
        const titleB = b.title.toUpperCase();
        if (ascending) {
          return titleB.localeCompare(titleA);
        } else {
          return titleA.localeCompare(titleB);
        }
      });
      setSortTitle(ascending);
      return sortedProducts;
    });
  };
  //sort Price
  const [minimum, setMinimum] = useState(""); // Corrected variable name
  const [maximum, setMaximum] = useState(""); // Corrected variable name
  const [priceRange, setPriceRange] = useState("");
  const MaximunMinimun = (minimum, maximum) => {
    // Corrected parameter name
    if (minimum !== "" && maximum !== "") {
      const filteredItems = [...originalItems].filter((item) => {
        const itemPrice = parseFloat(item.price);
        return (
          itemPrice >= parseFloat(minimum) && itemPrice <= parseFloat(maximum)
        );
      });

      if (filteredItems.length > 0) {
        setPriceRange(""); // Clear any previous error message
        setItems(filteredItems); // Set the filtered items
      } else {
        setPriceRange("Sorry, Price range not found."); // Set an error message
        setItems([]); // Clear the items list or set to an empty array if you want to indicate no results
      }
    }
  };

  //rating filter
  const handleRating = (e) => {
    const ratingStar = parseFloat(e); // Convert e to a numeric value

    const filteredItems = originalItems.filter((star) => {
      return star.rate >= ratingStar;
    });

    if (filteredItems.length === 0) {
      setPriceRange("Sorry, Rating range not found.");
    } else {
      setItems(filteredItems);
    }
  };

  //delete message after 5 seconds
  useEffect(() => {
    if (priceRange) {
      const timer = setTimeout(() => {
        setPriceRange("");
      }, 5000);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [priceRange]);

  //sort products icon and bar
  const [state, setState] = useState({
    left: false,
  });

  const toggleDrawer = (anchor, open) => (event) => {
    if (
      (event.type === "keydown" && event.key === "Tab") ||
      event.key === "Shift"
    ) {
      return;
    }

    setState({ ...state, [anchor]: open });
  };

  const list = (anchor) => (
    <Box
      sx={{ width: anchor === "top" || anchor === "bottom" ? "auto" : 250 }}
      role="presentation"
    >
      <List
        onClick={toggleDrawer(anchor, false)}
        onKeyDown={toggleDrawer(anchor, false)}
      >
        <ListItem key="Srot" disablePadding sx={{ display: "flex" }}>
          <ListItemText primary="Sort By" className="bold-text" />
        </ListItem>
        <ListItem key="sortTitle" disablePadding>
          <ListItemButton>
            <ListItemText primary="Title" onClick={() => sortByTitle()} />
          </ListItemButton>
        </ListItem>
        <ListItem key="SortPrice" disablePadding>
          <ListItemButton onClick={() => sortByPrice()}>
            <ListItemText primary="Price" />
          </ListItemButton>
        </ListItem>
        <Divider />
        <ListItem key="Price" disablePadding sx={{ display: "flex" }}>
          <ListItemText primary="Price" className="bold-text" />
        </ListItem>
        <ListItem disablePadding key="upTo25">
          <ListItemButton onClick={() => MaximunMinimun(0, 25)}>
            <ListItemText primary="up to $25" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding key="upTo50">
          <ListItemButton onClick={() => MaximunMinimun(25, 50)}>
            <ListItemText primary="$25 to $50" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding key="upTo100">
          <ListItemButton onClick={() => MaximunMinimun(50, 100)}>
            <ListItemText primary="$50 to $100" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding key="upTo200">
          <ListItemButton onClick={() => MaximunMinimun(100, 200)}>
            <ListItemText primary="$100 to $200" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding key="upTo300">
          <ListItemButton onClick={() => MaximunMinimun(200, 300)}>
            <ListItemText primary="$200 to $300" />
          </ListItemButton>
        </ListItem>
      </List>
      <ListItem
        disablePadding
        key="upTo300"
        sx={{ display: "flex", justifyContent: "center" }}
      >
        <Stack direction="column" spacing={2}>
          <FormControl variant="standard">
            <InputLabel htmlFor="input-with-icon-adornment">Min</InputLabel>
            <Input
              id="minimum"
              startAdornment={
                <InputAdornment position="start">
                  <AttachMoneyIcon />
                </InputAdornment>
              }
              onChange={(e) => setMinimum(e.target.value)}
            />
          </FormControl>
          <FormControl variant="standard">
            <InputLabel htmlFor="input-with-icon-adornment">Max</InputLabel>
            <Input
              id="maximun"
              startAdornment={
                <InputAdornment position="start">
                  <AttachMoneyIcon />
                </InputAdornment>
              }
              onChange={(e) => setMaximum(e.target.value)}
            />
          </FormControl>
          <Button
            variant="contained"
            onClick={() => {
              MaximunMinimun(minimum, maximum);
              toggleDrawer(anchor, false);
            }}
            className="buttonFilterPrice"
          >
            Search
          </Button>
        </Stack>
      </ListItem>
      <Divider />
      <List
        onClick={toggleDrawer(anchor, false)}
        onKeyDown={toggleDrawer(anchor, false)}
      >
        <ListItem key="CustomerReview" disablePadding sx={{ display: "flex" }}>
          <ListItemText primary="Customer Reviews" className="bold-text" />
        </ListItem>
        <ListItem disablePadding key="4start">
          <ListItemButton onClick={() => handleRating(4)}>
            <Rating name="read-only" value={4} size="small" readOnly />
            <span className="filterRating">& Up</span>
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding key="3start">
          <ListItemButton onClick={() => handleRating(3)}>
            <Rating name="read-only" value={3} size="small" readOnly />
            <span className="filterRating">& Up</span>
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding key="2start">
          <ListItemButton onClick={() => handleRating(2)}>
            <Rating name="read-only" value={2} size="small" readOnly />
            <span className="filterRating">& Up</span>
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding key="start">
          <ListItemButton onClick={() => handleRating(1)}>
            <Rating name="read-only" value={1} size="small" readOnly />
            <span className="filterRating">& Up</span>
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );
  return (
    <div className="containerPage">
      {isLoading ? (
        <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={isLoading}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      ) : (
        <>
          <div className="filterButton">
            <Fragment key="left">
              <Button
                onClick={toggleDrawer("left", true)}
                className="filterProductButton"
              >
                Filters&nbsp;
                <TuneIcon />
              </Button>
              <Drawer
                anchor="left"
                open={state["left"]}
                onClose={toggleDrawer("left", false)}
              >
                {list("left")}
              </Drawer>
            </Fragment>
          </div>
          {priceRange && (
            <Box
              sx={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                position: "fixed",
                zIndex: 3,
              }}
            >
              <Stack
                sx={{
                  width: "250px",
                }}
                spacing={2}
              >
                <Alert severity="error">{priceRange}</Alert>
              </Stack>
            </Box>
          )}
          <Grid
            container
            spacing={2}
            sx={{ justifyContent: "center" }}
            className="containerTopProducts"
          >
            {items ? (
              items
                .filter((products) => {
                  if (searchInput === "") {
                    return true; // Include all products when searchInput is empty
                  } else {
                    return (
                      products.category
                        .toLowerCase()
                        .includes(searchInput.toLowerCase()) ||
                      products.title
                        .toLowerCase()
                        .includes(searchInput.toLowerCase())
                    );
                  }
                })
                .map((products) => (
                  <Grid
                    item
                    xs={12}
                    sm={12}
                    md={4}
                    lg={3}
                    key={products.product_id}
                    className="positionCenter"
                    sx={{
                      fontFamily: "UbuntuNerdFont-Light",
                    }}
                  >
                    <Card className="card" style={{ borderColor: "white" }}>
                      <Link to={`/product/${products.product_id}`}>
                        <CardActionArea>
                          <div className="imageBox">
                            <CardMedia
                              component="img"
                              className="productImagen"
                              image={products.image_url}
                            />
                          </div>
                          <CardContent className="ProductDetail">
                            <Typography
                              gutterBottom
                              variant="h6"
                              component="div"
                              className="titleProduct"
                            >
                              {products.title}
                            </Typography>
                            <Typography variant="body2" component="div">
                              <div className="ratingProduct">
                                <Rating
                                  name="read-only"
                                  value={products.rate}
                                  precision={0.5}
                                  size="small"
                                  readOnly
                                />
                                <span className="blue-style">
                                  ({products.count})
                                </span>
                              </div>
                            </Typography>
                            <Typography
                              sx={{
                                fontFamily: "UbuntuNerdFont-bold",
                                fontSize: "1.1rem",
                              }}
                            >
                              ${products.price}
                            </Typography>
                          </CardContent>
                        </CardActionArea>
                      </Link>
                    </Card>
                  </Grid>
                ))
            ) : (
              <Box className="errorContainerSingleProduct">
                <Typography component="div" variant="p" id="sorry">
                  SORRY
                </Typography>
                <Typography component="div" variant="p" id="productnotfound">
                  we could&apos;n find that page
                </Typography>
                <Typography component="div" variant="p" id="trysearching">
                  try searching or go to{" "}
                  <Link to="/" id="homePageError">
                    FredZone&apos;s home page
                  </Link>
                </Typography>
              </Box>
            )}
          </Grid>{" "}
        </>
      )}
    </div>
  );
}

export default Products;
