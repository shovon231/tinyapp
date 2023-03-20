const express = require("express");
const app = express();
const PORT = 8080;
const cookieParser = require("cookie-parser");

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

function generateRandomString() {
  let result = " ";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 1; i <= 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

app.get("/", (req, res) => {
  res.send("index", "Welcome");
});

app.get("/urls", (req, res) => {
  //const templateVars = { urls: urlDatabase };
  // console.log(templateVars);
  const templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase,
    // ... any other vars
  };
  //console.log(templateVars);
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase,
    // ... any other vars
  };
  res.render("urls_new", templateVars);
});
app.post("/urls", (req, res) => {
  let randomStr = generateRandomString();
  urlDatabase[randomStr.trim()] = req.body.longURL;
  res.redirect("/urls/" + randomStr.trim());
});
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls/");
});
app.get("/u/:id", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase,
    // ... any other vars
  };
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase,
    longURL: urlDatabase[req.params.id],
    id: req.params.id,
    // ... any other vars
  };
  res.render("urls_show", templateVars);
});
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body[req.params.id];
  res.redirect("/urls");
});
app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls");
});
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});
app.listen(PORT, () => {
  console.log(`Example app listening on ports ${PORT}!`);
});
