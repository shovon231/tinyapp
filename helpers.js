//function for checking db If someone tries to register with an email that is
//already in the users object

const getUserByEmail = (email, database) => {
  for (const obj in database) {
    for (const key in database[obj]) {
      if (database[obj][key] === email) {
        return database[obj].id;
      }
    }
  }
  return undefined;
};

//function for random string
const generateRandomString = () => {
  let result = " ";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 1; i <= 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
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
  }
  return userURL;
};

module.exports = { getUserByEmail, generateRandomString, urlsForUser };

