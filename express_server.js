// Dependencies
const express = require("express");
const app = express();
var methodOverride = require("method-override");
const PORT = 8080;
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const {
  getUserByEmail,
  generateRandomString,
  urlsForUser,
} = require("./helpers");

//Middleware
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"],
    maxAge: 24 * 60 * 60 * 1000,
  })
);

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

//User DB
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

//Get routes

app.get("/urls", (req, res) => {
  const user = req.session.user_id;
  const userID = user.id;
  const urls = urlsForUser(urlDatabase, userID);
  const templateVars = { user, urls };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const user = req.session.user_id;
  const urls = urlDatabase;
  const templateVars = { user, urls };
  if (!user) {
    res.render("urls_login", templateVars);
  }
  res.render("urls_new", templateVars);
});

app.get("/u/:id", (req, res) => {
  const urls = urlDatabase[req.params.id];
  const longURL = urls.longURL;
  if (!urls) {
    res.status(403);
    res.send("Nothing to tell you!!");
  }
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
  const user = req.session.user_id;
  const urls = urlDatabase[req.params.id];
  const longURL = urls.longURL;
  const id = req.params.id;
  const templateVars = { user, urls, longURL, id };
  res.render("urls_show", templateVars);
});

app.get("/register", (req, res) => {
  const user = req.session.user_id;
  const urls = urlDatabase;
  const templateVars = { user, urls };
  if (!user) {
    res.render("urls_registration", templateVars);
  }
  res.render("urls_index", templateVars);
});

app.get("/login", (req, res) => {
  const user = req.session.user_id;
  const urls = urlDatabase;
  const templateVars = { user, urls };
  if (!user) {
    res.render("urls_login", templateVars);
  }
  console.log("4getlogin", users);
  res.render("urls_index", templateVars);
});

//Post routes
app.post("/urls", (req, res) => {
  const user = req.session.user_id;
  const userID = user.id;
  if (!user) {
    res.status(403);
    res.send("Please Login first/ register Yourself");
  }
  let randomStr = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[randomStr.trim()] = { longURL, userID };
  res.redirect("/urls/" + randomStr.trim());
});

app.delete("/urls/:id/delete", (req, res) => {
  const user = req.session.user_id;
  if (!user) {
    res.status(403);
    res.send("Please Login first/ register Yourself");
  }
  delete urlDatabase[req.params.id];
  res.redirect("/urls/");
});

app.post("/urls/:id", (req, res) => {
  const user = req.session.user_id;
  if (!user) {
    res.status(403);
    res.send("Please Login first/ register Yourself");
  }
  let dbID = urlDatabase[req.params.id];
  dbID.longURL = req.body[req.params.id];
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect("/login");
});

app.post("/register", (req, res) => {
  let id = generateRandomString().trim();
  const email = req.body.email;
  const inputtedPassword = req.body.password;
  const password = bcrypt.hashSync(inputtedPassword, 10);
  if (!email || !inputtedPassword) {
    res.status(400);
    res.send("Email and password can not be blank!!");
  } else if (getUserByEmail(users, email)) {
    res.status(400);
    res.send("This email alredy exists!! Try with another email.");
  } else {
    users[id] = { id, email, password };
    req.session.user_id = users[id];
    res.redirect("/urls");
  }
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (getUserByEmail(email, users)) {
    const userID = getUserByEmail(email, users);
    if (bcrypt.compareSync(password, userID.password)) {
      let id = getUserByEmail(email, users).id;
      req.session.user_id = { id, email, password };
      res.redirect("/urls");
    }
    res.status(403);
    res.send("Password does not match,");
  }
  res.status(403);
  res.send("user with that e-mail cannot be found");
});

// Server up
app.listen(PORT, () => {
  console.log(`Example app listening on ports ${PORT}!`);
});
