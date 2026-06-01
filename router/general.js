const express = require("express");
let books = require("../booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require("axios");

const BASE_URL = "http://localhost:3000";

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (isValid(username)) {
    return res.status(409).json({ message: "Username already exists" });
  }

  users.push({ username, password });
  return res.status(201).json({ message: "User successfully registered. Now you can login" });
});

// Task 1 - Get the book list available in the shop (async/await with Axios)
public_users.get("/", async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/books`);
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(200).json(books);
  }
});

// Internal endpoint for books data
public_users.get("/books", (req, res) => {
  return res.status(200).json(books);
});

// Task 2 - Get book details based on ISBN (async/await with Axios)
public_users.get("/isbn/:isbn", async (req, res) => {
  const isbn = req.params.isbn;
  try {
    const response = await axios.get(`${BASE_URL}/books`);
    const allBooks = response.data;
    const book = allBooks[isbn];
    if (book) {
      return res.status(200).json(book);
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
  } catch (error) {
    const book = books[isbn];
    if (book) {
      return res.status(200).json(book);
    }
    return res.status(404).json({ message: "Book not found" });
  }
});

// Task 3 - Get book details based on Author (promise callbacks with Axios)
public_users.get("/author/:author", (req, res) => {
  const author = req.params.author;
  axios
    .get(`${BASE_URL}/books`)
    .then((response) => {
      const allBooks = response.data;
      const matchingBooks = Object.values(allBooks).filter(
        (book) => book.author.toLowerCase() === author.toLowerCase()
      );
      if (matchingBooks.length > 0) {
        return res.status(200).json(matchingBooks);
      } else {
        return res.status(404).json({ message: "No books found for this author" });
      }
    })
    .catch(() => {
      const matchingBooks = Object.values(books).filter(
        (book) => book.author.toLowerCase() === author.toLowerCase()
      );
      if (matchingBooks.length > 0) {
        return res.status(200).json(matchingBooks);
      }
      return res.status(404).json({ message: "No books found for this author" });
    });
});

// Task 4 - Get book details based on Title (async/await with Axios)
public_users.get("/title/:title", async (req, res) => {
  const title = req.params.title;
  try {
    const response = await axios.get(`${BASE_URL}/books`);
    const allBooks = response.data;
    const matchingBooks = Object.values(allBooks).filter(
      (book) => book.title.toLowerCase() === title.toLowerCase()
    );
    if (matchingBooks.length > 0) {
      return res.status(200).json(matchingBooks);
    } else {
      return res.status(404).json({ message: "No books found with this title" });
    }
  } catch (error) {
    const matchingBooks = Object.values(books).filter(
      (book) => book.title.toLowerCase() === title.toLowerCase()
    );
    if (matchingBooks.length > 0) {
      return res.status(200).json(matchingBooks);
    }
    return res.status(404).json({ message: "No books found with this title" });
  }
});

// Task 5 - Get book review
public_users.get("/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    return res.status(200).json(book.reviews);
  }
  return res.status(404).json({ message: "Book not found" });
});

module.exports.general = public_users;
