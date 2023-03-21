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

// function which returns the URLs where the userID is equal to the id of the currently logged-in user.
const urlsForUser = (urlDatabase, id) => {
  const userURL = {};
  if (!id) {
    return null;
  }
  for (const shortID in urlDatabase) {
    if (urlDatabase[shortID].userID === id) {
      userURL[shortID] = urlDatabase[shortID].longURL;
    }
    //return null;
  }
  return userURL;
};

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
  const user = req.cookies["user_id"];
  let userID;
  console.log(user);
  if (!user) {
    userID = null;
  } else {
    userID = user.id;
  }
  const urls = urlsForUser(urlDatabase, userID);
  //const urls = urlsForUser(urlDatabase, userID);
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
  const urls = urlDatabase[req.params.id];
  const templateVars = { user, urls };
  const longURL = urls.longURL;
  const id = req.body.id;
  // console.log(id);
  if (!urls) {
    res.status(403);
    res.send("Nothing to tell you!!");
  }
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
  const user = req.cookies["user_id"];
  const urls = urlDatabase[req.params.id];
  const longURL = urls.longURL;
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
  const userID = user.id;
  if (!userID) {
    res.status(403);
    res.send("Please Login first/ register Yourself");
  }
  let randomStr = generateRandomString();

  const longURL = req.body.longURL;
  urlDatabase[randomStr.trim()] = { longURL, userID };
  //console.log(urlDatabase);
  res.redirect("/urls/" + randomStr.trim());
});

app.post("/urls/:id/delete", (req, res) => {
  const user = req.cookies["user_id"];
  //console.log(userID)
  if (!user) {
    res.status(403);
    res.send("Please Login first/ register Yourself");
  }
  delete urlDatabase[req.params.id];
  res.redirect("/urls/");
});

app.post("/urls/:id", (req, res) => {
  const user = req.cookies["user_id"];
  if (!user) {
    res.status(403);
    res.send("Please Login first/ register Yourself");
  }
  let dbID = urlDatabase[req.params.id];
  dbID.longURL = req.body[req.params.id];
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
      console.log(user);
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
