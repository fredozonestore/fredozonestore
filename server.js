import express from "express";
import pg from "pg";
import cors from "cors";
const { Pool } = pg;

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "DigitalStorage",
  password: "2145",
  port: 5433,
});

// Manejo de una solicitud GET en la raíz
app.get("/", (req, res) => {
  res.send("¡Hola, mundo!");
});

app.get("/usuarios", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users");
    res.json(result.rows);
    console.log(result.rows);
  } catch (error) {
    console.error("Error al obtener usuarios", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

app.get("/address", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM address");
    res.json(result.rows);
    console.log(result.rows);
  } catch (error) {
    console.error("Error al obtener usuarios", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

//add user
app.post("/addUser", async (req, res) => {
  try {
    const {
      username,
      password,
      first_name,
      last_name,
      email,
      phone_number,
      address,
    } = req.body;

    const insertQuery = await pool.query(
      "INSERT INTO users (username,  password, first_name, last_name, email, phone_number) VALUES ($1, $2, $3, $4, $5, $6) RETURNING users_id",
      [username, password, first_name, last_name, email, phone_number]
    );
    const userId = insertQuery.rows[0].users_id;
    const addressData = address;
    const { street, city, state, zipcode, name } = addressData;

    await pool.query(
      "INSERT INTO public.address (address, city, state, zipcode, name, users_id) VALUES ($1, $2, $3, $4, $5, $6)",
      [street, city, state, zipcode, name, userId]
    );

    // console.log("Usuario y dirección insertados con éxito");
    res.json({ message: "Data inserted successfully" });
  } catch (error) {
    console.error("Error inserting data:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

//search unic email
app.post("/check-email-unique", async (req, res) => {
  const { email } = req.body; // Parse email from the request body

  try {
    const query = "SELECT COUNT(*) FROM users WHERE email = $1";
    const result = await pool.query(query, [email]);
    const isUnique = result.rows[0].count === "0"; // Assuming 'count' is a string

    res.json({ unique: isUnique });
  } catch (error) {
    console.error("Error checking email uniqueness:", error);
    res.status(500).json({ error: "An error occurred." });
  }
});

//search unic username
app.post("/check-username-unique", async (req, res) => {
  const { username } = req.body; // Parse email from the request body

  try {
    const query = "SELECT COUNT(*) FROM users WHERE username = $1";
    const result = await pool.query(query, [username]);
    const isUnique = result.rows[0].count === "0"; // Assuming 'count' is a string

    res.json({ unique: isUnique });
  } catch (error) {
    console.error("Error checking username uniqueness:", error);
    res.status(500).json({ error: "An error occurred." });
  }
});

//login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const query =
      "SELECT token, users_id FROM users WHERE username = $1 and password = $2";
    const result = await pool.query(query, [username, password]);
    const token = result.rows[0].token;
    const usersId = result.rows[0].users_id;
    res.json({ token: token, userId: usersId });
  } catch (error) {
    res.status(500).json({ error: "An error occurred." });
  }
});

app.get("/products", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM product");

    const productsWithParsedFields = result.rows.map((product) => ({
      ...product,
      rate: parseFloat(product.rate),
      price: parseFloat(product.price),
    }));

    res.json(productsWithParsedFields);
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

//get category
app.get("/products/categories", async (req, res) => {
  try {
    const result = await pool.query("SELECT DISTINCT category FROM product");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

//get product by category
app.get("/products/categories/:category", async (req, res) => {
  const categoryName = req.params.category;
  try {
    const query = "SELECT * FROM product WHERE category = $1";
    const result = await pool.query(query, [categoryName]);
    const productsWithParsedFields = result.rows.map((product) => ({
      ...product,
      rate: parseFloat(product.rate),
      price: parseFloat(product.price),
    }));
    res.json(productsWithParsedFields);
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

//get single product
app.get("/products/:id", async (req, res) => {
  const productId = req.params.id;
  try {
    const query = "SELECT * FROM product WHERE product_id = $1";
    const result = await pool.query(query, [productId]);
    const productsWithParsedFields = result.rows.map((product) => ({
      ...product,
      rate: parseFloat(product.rate),
      price: parseFloat(product.price),
    }));
    res.json(productsWithParsedFields);
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

//add to cart
app.post("/cart", async (req, res) => {
  try {
    const { product_id, userId } = req.body;

    const selectQuery = await pool.query(
      "SELECT COUNT(*) FROM cart WHERE product_id = $1 AND users_id = $2",
      [product_id, userId]
    );

    const isUnique = selectQuery.rows[0].count === "0";

    if (isUnique) {
      await pool.query(
        "INSERT INTO cart (product_id, amount, users_id) VALUES ($1, $2, $3)",
        [product_id, 1, userId]
      );
    } else {
      await pool.query(
        "UPDATE cart SET amount = amount + 1 WHERE product_id = $1 AND users_id = $2",
        [product_id, userId]
      );
    }

    res.json({ message: "Data inserted successfully" });
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
});

//get all cart
app.post("/getCart", async (req, res) => {
  const { userId } = req.body;

  try {
    const query =
      "SELECT * FROM cart AS C INNER JOIN product AS P ON p.product_id = C.product_id WHERE users_id = $1 ORDER BY cart_id";
    const result = await pool.query(query, [userId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "An error occurred." });
  }
});

//update single prodcut cart
app.post("/updateCart", async (req, res) => {
  try {
    const { amount, product_id, userId } = req.body;

    await pool.query(
      "UPDATE cart SET amount = $1 WHERE product_id = $2 AND users_id = $3",
      [amount, product_id, userId]
    );

    res.json({ message: "Data updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "An error occurred." });
  }
});

//update single prodcut cart
app.post("/deleteCart", async (req, res) => {
  try {
    const { product_id, userId } = req.body;

    await pool.query(
      "DELETE FROM cart WHERE product_id = $1 AND users_id = $2",
      [product_id, userId]
    );

    res.json({ message: "Data deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "An error occurred." });
  }
});

//update single prodcut cart
app.post("/deleteCartAfterCheckout", async (req, res) => {
  try {
    const { userId } = req.body;

    await pool.query("DELETE FROM cart WHERE users_id = $1", [userId]);

    res.json({ message: "Data deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "An error occurred." });
  }
});

//update cart amount
app.post("/getCartItemAmount", async (req, res) => {
  try {
    const { userId } = req.body;

    const query =
      "SELECT SUM(amount) as total_amount FROM cart WHERE users_id = $1";
    const result = await pool.query(query, [userId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "An error occurred." });
  }
});

//from Guest to user
app.post("/addGuestToUser", async (req, res) => {
  try {
    const { product_id, userId, countQ } = req.body;

    const selectQuery = await pool.query(
      "SELECT COUNT(*) FROM cart WHERE product_id = $1 AND users_id = $2",
      [product_id, userId]
    );

    const isUnique = selectQuery.rows[0].count === "0";

    if (isUnique) {
      await pool.query(
        "INSERT INTO cart (product_id, amount, users_id) VALUES ($1, $2, $3)",
        [product_id, countQ, userId]
      );
    } else {
      await pool.query(
        "UPDATE cart SET amount = amount + $1 WHERE product_id = $2 AND users_id = $3",
        [countQ, product_id, userId]
      );
    }
    res.json({ message: countQ });
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
});

//get Address
app.post("/getAddress", async (req, res) => {
  try {
    const { userId } = req.body;
    const query = "SELECT * FROM address WHERE users_id = $1";
    const result = await pool.query(query, [userId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "An error occurred." });
  }
});

app.post("/checkout", async (req, res) => {
  try {
    const cartItems = req.body;

    let email = "";
    let address = "";
    if (cartItems.email === "") {
      email = "";
    } else {
      email = cartItems.email;
    }

    if (cartItems.address === "") {
      address = "";
    } else {
      address = cartItems.address;
    }
    const currentDate = new Date();
    const userId = parseInt(cartItems.userId);
    const totalPrice = parseFloat(cartItems.totalPrice);
    const grandTotal = parseFloat(cartItems.GrandTotalArray);
    const insertQuery = await pool.query(
      "INSERT INTO orders (users_id, order_date, total_amount, payment_status, taxes, grand_total, email, address_id) VALUES ($1, $2, $3, $4, $5, $6,$7,$8) RETURNING orders_id",
      [
        userId,
        currentDate,
        totalPrice,
        true,
        cartItems.taxes,
        grandTotal,
        email,
        address,
      ]
    );
    const ordersId = insertQuery.rows[0].orders_id;

    const insertions = cartItems.productDb.map(async (item) => {
      await pool.query(
        "INSERT INTO order_details (orders_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)",
        [ordersId, item.product_id, item.amount, parseFloat(item.price)]
      );
    });
    await Promise.all(insertions);
    res.status(200).json({ message: "Data updated successfully" });
  } catch (error) {
    console.error("Error in /checkout:", error);
    res.status(500).json({ error: "An error occurred." });
  }
});

//checkout add to order and order_history DB with New Address
app.post("/checkoutNewAddress", async (req, res) => {
  try {
    const cartItems = req.body;

    let email = "";

    if (cartItems.email === "") {
      email = null;
    } else {
      email = cartItems.email;
    }

    let userId = "";

    if (cartItems.userId === "") {
      userId = null;
    } else {
      userId = parseInt(cartItems.userId);
    }

    //changing the first letter to UpperCase to FirstName and LastName
    //first letter uppercase NAME
    const firstLetter = cartItems.firstName.charAt(0);
    const firstLetterCap = firstLetter.toUpperCase();
    const remainingLetters = cartItems.firstName.slice(1);
    const capitalizedWord = firstLetterCap + remainingLetters;

    //first letter uppercase LASTNAME
    const firstLetterLastName = cartItems.lastName.charAt(0);
    const firstLetterCapLastName = firstLetterLastName.toUpperCase();
    const remainingLettersLastName = cartItems.lastName.slice(1);
    const capitalizedWordLastName =
      firstLetterCapLastName + remainingLettersLastName;

    const fullName = `${capitalizedWord} ${capitalizedWordLastName} `;

    const addressInsertQuery = await pool.query(
      "INSERT INTO address (address, city, state, zipcode, name, users_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING address_id",
      [
        cartItems.street,
        cartItems.city,
        cartItems.state,
        cartItems.zipcode,
        fullName,
        userId || null,
      ]
    );

    const address = addressInsertQuery.rows[0].address_id;

    const currentDate = new Date();
    const totalPrice = parseFloat(cartItems.totalPrice);
    const grandTotal = parseFloat(cartItems.GrandTotalArray);
    const insertQuery = await pool.query(
      "INSERT INTO orders (users_id, order_date, total_amount, payment_status, taxes, grand_total, email, address_id) VALUES ($1, $2, $3, $4, $5, $6,$7,$8) RETURNING orders_id",
      [
        userId || null,
        currentDate,
        totalPrice,
        true,
        cartItems.taxes,
        grandTotal,
        email || null,
        address,
      ]
    );
    const ordersId = insertQuery.rows[0].orders_id;

    const insertions = cartItems.productDb.map(async (item) => {
      await pool.query(
        "INSERT INTO order_details (orders_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)",
        [ordersId, item.product_id, item.amount, parseFloat(item.price)]
      );
    });
    await Promise.all(insertions);
    res.status(200).json({ message: "Data updated successfully" });
  } catch (error) {
    console.error("Error in /checkout:", error);
    res.status(500).json({ error: "An error occurred." });
  }
});

//get order details
app.post("/orderHistory", async (req, res) => {
  try {
    const { userId } = req.body;
    const query =
      "SELECT C.users_id, to_char(C.order_date, 'FMMonth DD, YYYY') AS order_date, C.payment_status, C.orders_id, C.email, C.address_id, C.taxes, C.grand_total, C.total_amount, A.address, A.city, A.zipcode, A.state, A.name, O.orders_id, O.quantity, O.price, O.product_id, P.title, P.image_url FROM orders AS C INNER JOIN address AS A ON A.address_id = C.address_id INNER JOIN order_details AS O ON O.orders_id = C.orders_id INNER JOIN product AS P ON P.product_id = O.product_id WHERE C.users_id = $1 ORDER BY C.order_date DESC";
    const result = await pool.query(query, [userId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "An error occurred." });
  }
});

//add review
app.post("/addReview", async (req, res) => {
  try {
    // const { , userId, title, description, rating } = req.body;
    const productReview = req.body;
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const day = String(now.getDate()).padStart(2, "0");
    const currentDate = `${year}-${month}-${day}`;

    await pool.query(
      "INSERT INTO review (users_id, product_id, title, description, rate, date) VALUES ($1, $2, $3, $4, $5, $6) ",
      [
        productReview.userId,
        productReview.product_id,
        productReview.title,
        productReview.description,
        productReview.rating,
        currentDate,
      ]
    );

    res.json({ message: "Data inserted successfully" });
  } catch (error) {
    console.error("Error inserting data:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

//get reviews
app.post("/getReview", async (req, res) => {
  const { product_id } = req.body;

  try {
    const query =
      "SELECT U.username,R.review_id, R.title, R.description, R.rate, to_char(R.date, 'FMMonth DD, YYYY') AS formatted_date FROM review AS R INNER JOIN users AS U ON R.users_id = U.users_id  WHERE R.product_id = $1 ORDER By R.review_id DESC";
    const result = await pool.query(query, [product_id]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "An error occurred." });
  }
});

app.listen(port, () => {
  console.log(`Servidor en funcionamiento en http://localhost:${port}`);
});
