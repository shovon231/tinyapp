// Dependencies
/*

*/

const express = require("express");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const methodOverride = require("method-override");

const app = express();
const PORT = 8080;

app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"],
    maxAge: 24 * 60 * 60 * 1000,
  })
);
const {
  getUserByEmail,
  generateRandomString,
  urlsForUser,
  redirect,
} = require("./helpers");

//Database

const { urlDatabase, users } = require("./database");

//Get routes

app.get("/urls", (req, res) => {
  if (!req.session.user_id) {
    setTimeout(res.redirect("/login"), 5000);
    res.status(403);
    res.send("Please Login first/ register Yourself");
  } else {
    const user = req.session.user_id;
    const userID = user.id;
    const urls = urlsForUser(urlDatabase, userID);
    const templateVars = { user, urls };
    res.render("urls_index", templateVars);
  }
});

app.get("/urls/new", (req, res) => {
  //console.log(req.session.user_id);
  if (!req.session.user_id) {
    res.status(403);
    res.send("Please Login first/ register Yourself");
  } else {
    const user = req.session.user_id;
    const urls = urlDatabase;
    const templateVars = { user, urls };
    res.render("urls_new", templateVars);
  }
});

app.get("/u/:id", (req, res) => {
  if (!req.session.user_id) {
    res.status(403);
    res.send("Nothing to tell you!!");
  } else {
    const urls = urlDatabase[req.params.id];
    const longURL = urls.longURL;
    res.redirect(longURL);
  }
});

app.get("/urls/:id", (req, res) => {
  if (!req.session.user_id) {
    res.status(403);
    res.send("Please Login first/ register Yourself");
  } else {
    const user = req.session.user_id;
    const urls = urlDatabase[req.params.id];
    const longURL = urls.longURL;
    const id = req.params.id;
    const templateVars = { user, urls, longURL, id };
    res.render("urls_show", templateVars);
  }
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
  if (!req.session.user_id) {
    res.status(403);
    res.send("Please Login first/ register Yourself");
  } else {
    const user = req.session.user_id;
    const userID = user.id;
    let randomStr = generateRandomString();
    const longURL = req.body.longURL;
    urlDatabase[randomStr.trim()] = { longURL, userID };
    //res.redirect("/urls/" + randomStr.trim());
    res.redirect("/urls");
  }
});

app.delete("/urls/:id", (req, res) => {
  if (!req.session.user_id) {
    res.status(403);
    res.send("Please Login first/ register Yourself");
  } else {
    const user = req.session.user_id;
    delete urlDatabase[req.params.id];
    res.redirect("/urls/");
  }
});

app.post("/urls/:id", (req, res) => {
  if (!req.session.user_id) {
    res.status(403);
    res.send("Please Login first/ register Yourself");
  }
  const user = req.session.user_id;
  let dbID = urlDatabase[req.params.id];
  dbID.longURL = req.body[req.params.id];
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.post("/register", (req, res) => {
  let id = generateRandomString().trim();
  const email = req.body.email;
  const inputtedPassword = req.body.password;
  const password = bcrypt.hashSync(inputtedPassword, 10);
  console.log(email);
  console.log(getUserByEmail(email, users));
  console.log(users);
  if (!email || !inputtedPassword) {
    console.log("1");
    res.status(400);
    res.send("Email and password can not be blank!!");
  } else if (getUserByEmail(email, users)) {
    console.log("2");
    res.status(400);
    res.send("This email alredy exists!! Try with another email.");
  } else {
    console.log("3");
    users[id] = { id, email, password };
    req.session.user_id = users[id];
    res.redirect("/urls");
  }
});

app.post("/login", (req, res) => {
  let id = getUserByEmail(req.body.email, users);
  console.log(users);
  console.log(id);
  const email = req.body.email;
  const password = req.body.password;
  if (!id) {
    res.status(403);
    res.send("user with that e-mail cannot be found");
  }
  //const userID = getUserByEmail(email, users);
  if (bcrypt.compareSync(password, users[id].password)) {
    //let id = getUserByEmail(email, users);
    req.session.user_id = { id, email, password };
    console.log(req.session.user_id);
    res.redirect("/urls");
  }
  res.status(403);
  res.send("Password does not match,");
});

// Server up
app.listen(PORT, () => {
  console.log(`Example app listening on ports ${PORT}!`);
});
