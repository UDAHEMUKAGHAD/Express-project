const express = require("express");
const bcrypt = require("bcrypt");
const session = require("express-session");
const db = require("./db.js");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(
  session({
    secret: "secret_key_123",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 40000 // 40 seconds
    }
  })
);


app.get("/", (req, res) => {
  res.redirect("/login");
});

app.get("/signup", (req, res) => {
  res.sendFile(__dirname + "/public/sign.html");
});

app.get("/login", (req, res) => {
  res.sendFile(__dirname + "/public/log.html");
});

app.get("/dashbrd", (req, res) => {
  if (!req.session.user) {
    return res.send(
      "Access denied! Session expired or not logged in. <a href='/login'>Login</a>"
    );
  }

  res.sendFile(__dirname + "/public/dashbrd.html");
});

app.post("/signup", async (req, res) => {
  const { fullname, email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const sql = "INSERT INTO userss (fullname, email, password) VALUES (?, ?, ?)";

  db.query(sql, [fullname, email, hashedPassword], (err, result) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.send("Email already exists! <a href='/signup'>Try again</a>");
      }
      return res.send("Error saving user: " + err);
    }

    res.send(
      "Account created successfully! " +
        fullname +
        " <a href='/login'>Login Now</a>"
    );
  });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM userss WHERE email = ?", [email], async (err, result) => {
    if (err) return res.send("Database error");

    if (result.length === 0) {
      return res.send("No account with this email. <a href='/signup'>Sign Up</a>");
    }
    const user = result[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.send("Wrong password! <a href='/login'>Try again</a>");
    }
    req.session.user = {
      id: user.id,
      email: user.email
    };

    res.redirect("/dashbrd");
  });
});
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.send("Error logging out");
    res.redirect("/login");
  });
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
