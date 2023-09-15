import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import CryptoJS from "crypto-js";
function OrderHistory({ userId }) {
  const location = useLocation();
  const { messageReview, messageTypeReview } = location.state || {};
  const [orderHistory, setOrderHistory] = useState([]);
  const [sortOrderHistory, setSortOrderHistory] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };
  const handleOrderHistory = async () => {
    const user = {
      userId: userId,
    };
    try {
      const response = await fetch("http://localhost:3000/orderHistory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });

      const result = await response.json();
      setOrderHistory(result);

      if (Array.isArray(result)) {
        const ordersData = {};

        // Recorre el arreglo original
        orderHistory.forEach((item) => {
          const {
            orders_id,
            address,
            city,
            state,
            zipcode,
            title,
            price,
            quantity,
            image_url,
            product_id,
            ...rest
          } = item;

          if (ordersData[orders_id]) {
            const existingAddress = ordersData[orders_id].addresses.find(
              (existing) =>
                existing.address === address &&
                existing.city === city &&
                existing.state === state &&
                existing.zipcode === zipcode
            );
            //adding the address for first time
            if (!existingAddress) {
              ordersData[orders_id].addresses.push({
                address,
                city,
                state,
                zipcode,
              });
            }
          } else {
            // creating the array inside of ordersData
            ordersData[orders_id] = {
              ...rest,
              addresses: [{ address, city, state, zipcode }],
              products: [],
            };
          }
          //adding product to products
          const product = { title, price, quantity, image_url, product_id };
          ordersData[orders_id].products.push(product);
        });

        const resultArray = Object.values(ordersData);
        setSortOrderHistory(resultArray);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    handleOrderHistory();
  }, [sortOrderHistory, userId]);

  //creating the cryto
  const valueToHide = "true";
  const hash = CryptoJS.SHA256(valueToHide).toString();

  useEffect(() => {
    if (messageReview === "Your review has been successfully created!") {
      setMessage(messageReview);
      setMessageType(messageTypeReview);
    }
  }, [messageReview]);

  //delete message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 5000);

      return () => {
        window.history.replaceState({}, document.title);
        clearTimeout(timer);
      };
    }
  }, [message, location.state]);
  return (
    <div className="containerPage" style={{ minHeight: "85.2vh" }}>
      <div className="alertStyleBox">
        {message && (
          <Stack sx={{ width: "100%" }} spacing={2}>
            <Alert severity={messageType}>{message}</Alert>
          </Stack>
        )}
      </div>
      <div className="orderReverse">
        {sortOrderHistory.length > 0 ? (
          <Box sx={{ flexGrow: 1 }}>
            <h1 style={{ display: "flex", justifyContent: "center" }}>
              OrderHistory
            </h1>
            <Grid
              container
              spacing={1}
              sx={{
                display: "flex",
                flexDirection: "column-reverse",
                alignItems: "center",
              }}
            >
              {sortOrderHistory.map((items, index) => (
                <Grid key={index} item xs={12} md={6} lg={6}>
                  <Accordion
                    expanded={expanded === index}
                    onChange={handleChange(index)}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls={`${index}bh-content`}
                      id={`${index}bh-header`}
                    >
                      <Typography sx={{ width: "100%", flexShrink: 0 }}>
                        {items.order_date}
                        <br />
                        {items.name}
                        <br />
                        {items.addresses.map((direction, dirIndex) => (
                          <span
                            key={dirIndex}
                            style={{ color: "rgba(0, 0, 0, 0.6)" }}
                          >
                            {direction.address}, {direction.city},{" "}
                            {direction.state}, {direction.zipcode}
                          </span>
                        ))}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <div>
                        <div className="cartSubtotal">
                          <Typography
                            variant="p"
                            component="div"
                            className="totalInfo"
                          >
                            Subtotal :
                          </Typography>
                          <Typography
                            variant="p"
                            component="div"
                            className="amount"
                          >
                            ${items.total_amount}
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
                            $7.00
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
                            ${items.taxes}
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
                            ${items.grand_total}
                          </Typography>
                        </div>
                        <hr />
                      </div>
                      <div>
                        {items.products.map((product, dirIndex) => (
                          <div
                            key={dirIndex}
                            style={{ color: "rgba(0, 0, 0, 0.6)" }}
                          >
                            <Grid
                              item
                              xs={12}
                              md={12}
                              lg={12}
                              key={product.product_id}
                              className="sizeContainerCard"
                            >
                              <Card
                                className="cardProduct"
                                sx={{ boxShadow: "none" }}
                              >
                                <Box className="imagenSingleProductOrderHistory">
                                  <CardMedia
                                    component="img"
                                    image={product.image_url}
                                    className="imagenCart"
                                  ></CardMedia>
                                </Box>
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                  }}
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
                                    Qty: {product.quantity} @ ${product.price}
                                  </Typography>
                                  <Typography
                                    variant="p"
                                    component="div"
                                    className="cartSingleProduct"
                                  >
                                    <Link
                                      to={`/product/${product.product_id}/${hash}`}
                                      className="reviewLink"
                                    >
                                      Write a product review
                                    </Link>
                                  </Typography>
                                </Box>
                              </Card>
                            </Grid>
                          </div>
                        ))}
                      </div>
                    </AccordionDetails>
                  </Accordion>
                </Grid>
              ))}
            </Grid>
          </Box>
        ) : (
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <p>NOTHING </p>
          </Box>
        )}
      </div>
    </div>
  );
}

export default OrderHistory;
