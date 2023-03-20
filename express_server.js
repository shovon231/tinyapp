// Dependencies
const express = require("express");
const app = express();
const PORT = 8080;
const cookieParser = require("cookie-parser");

//Middleware
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//function for random string
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
//function for checking db If someone tries to register with an email that is
//already in the users object

const getUserByEmail = (inputObj, searchItem) => {
  for (const obj in inputObj) {
    for (const key in inputObj[obj]) {
      if (inputObj[obj][key] === searchItem) {
        return inputObj[obj];
      }
    }
  }
  return undefined;
};

//Database
//Url DB
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
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
  const user = req.cookies["user_id"];
  const urls = urlDatabase;
  const templateVars = { user, urls };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const user = req.cookies["user_id"];
  const urls = urlDatabase;
  const templateVars = { user, urls };
  if (!user) {
    res.render("urls_login", templateVars);
  }
  res.render("urls_new", templateVars);
});

app.get("/u/:id", (req, res) => {
  const user = req.cookies["user_id"];
  const urls = urlDatabase;
  const templateVars = { user, urls };
  const longURL = urls[req.params.id];
  const id = req.body.id;
  // console.log(id);
  if (!id) {
    res.status(403);
    res.send("Nothing to tell you!!");
  }
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
  const user = req.cookies["user_id"];
  const urls = urlDatabase;
  const longURL = urlDatabase[req.params.id];
  const id = req.params.id;
  const templateVars = { user, urls, longURL, id };

  res.render("urls_show", templateVars);
});

app.get("/register", (req, res) => {
  const user = req.cookies["user_id"];
  const urls = urlDatabase;
  const templateVars = { user, urls };
  if (!user) {
    res.render("urls_registration", templateVars);
  }
  res.render("urls_index", templateVars);
});

app.get("/login", (req, res) => {
  const user = req.cookies["user_id"];
  const urls = urlDatabase;
  const templateVars = { user, urls };
  if (!user) {
    res.render("urls_login", templateVars);
  }
  res.render("urls_index", templateVars);
});

//Post routes
app.post("/urls", (req, res) => {
  const user = req.cookies["user_id"];
  if (!user) {
    res.status(403);
    res.send("Please Login first/ register Yourself");
  }
  let randomStr = generateRandomString();
  urlDatabase[randomStr.trim()] = req.body.longURL;
  res.redirect("/urls/" + randomStr.trim());
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls/");
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body[req.params.id];
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

app.post("/register", (req, res) => {
  let id = generateRandomString().trim();
  const email = req.body.email;
  const password = req.body.password;

  if ((email === null && email === "") || (password === null && email === "")) {
    res.status(400);
    res.send("Email and password can not be blank!!");
  } else if (getUserByEmail(users, email)) {
    res.status(400);
    res.send("This email alredy exists!! Try with another email.");
  } else {
    users[id] = { id, email, password };
    res.cookie("user_id", users[id]);
    res.redirect("/urls");
  }
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (getUserByEmail(users, email)) {
    if (getUserByEmail(users, password)) {
      let user = getUserByEmail(users, email);
      res.cookie("user_id", user);
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
