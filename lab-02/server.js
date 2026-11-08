const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
const PORT = process.env.PORT || 3000;
const dbPath = path.join(__dirname, "books.db");

let db = null;

// Initialize SQLite database and start the Express server
const initializeDatabaseAndServer = async () => {
    try {
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        });

        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error(`Database initialization error: ${error.message}`);
        process.exit(1);
    }
};

initializeDatabaseAndServer();

// Middleware to parse incoming JSON request bodies
app.use(express.json());

// Middleware to catch and handle malformed JSON syntax errors
app.use((error, request, response, next) => {
    if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
        return response.status(400).json({ error: "Malformed JSON in request body" });
    }
    next(error);
});

// Helper function to validate and parse positive integer IDs
const parseBookId = (paramValue) => {
    const id = Number(paramValue);
    if (Number.isInteger(id) && id > 0) {
        return id;
    }
    return null;
};

// Helper function to validate book payload fields
const validateBookBody = (body) => {
    if (!body || typeof body !== "object") {
        return "Request body must be a valid JSON object";
    }

    const { title, author, price, pages } = body;

    if (typeof title !== "string" || title.trim() === "") {
        return "Field 'title' must be a non-empty string";
    }

    if (typeof author !== "string" || author.trim() === "") {
        return "Field 'author' must be a non-empty string";
    }

    if (!Number.isInteger(price) || price < 0) {
        return "Field 'price' must be a non-negative integer";
    }

    if (!Number.isInteger(pages) || pages <= 0) {
        return "Field 'pages' must be a positive integer";
    }

    return null;
};

// GET /books/ - Retrieve all books ordered by ID
app.get(["/books", "/books/"], async (request, response) => {
    try {
        const getBooksQuery = "SELECT * FROM book ORDER BY id ASC;";
        const books = await db.all(getBooksQuery);
        response.status(200).json(books);
    } catch (error) {
        console.error(`Error retrieving books: ${error.message}`);
        response.status(500).json({ error: "Internal Server Error" });
    }
});

// GET /books/:bookId/ - Retrieve a single book by ID
app.get(["/books/:bookId", "/books/:bookId/"], async (request, response) => {
    try {
        const bookId = parseBookId(request.params.bookId);
        if (bookId === null) {
            return response.status(400).json({ error: "bookId must be a positive whole number" });
        }

        const getBookQuery = "SELECT * FROM book WHERE id = ?;";
        const book = await db.get(getBookQuery, [bookId]);

        if (!book) {
            return response.status(404).json({ error: "Book not found" });
        }

        response.status(200).json(book);
    } catch (error) {
        console.error(`Error retrieving book: ${error.message}`);
        response.status(500).json({ error: "Internal Server Error" });
    }
});

// POST /books/ - Add a new book
app.post(["/books", "/books/"], async (request, response) => {
    try {
        const validationError = validateBookBody(request.body);
        if (validationError) {
            return response.status(400).json({ error: validationError });
        }

        const { title, author, price, pages } = request.body;
        const addBookQuery = "INSERT INTO book (title, author, price, pages) VALUES (?, ?, ?, ?);";
        const result = await db.run(addBookQuery, [title.trim(), author.trim(), price, pages]);

        response.status(201).json({
            message: "Book added",
            bookId: result.lastID
        });
    } catch (error) {
        console.error(`Error adding book: ${error.message}`);
        response.status(500).json({ error: "Internal Server Error" });
    }
});

// PUT /books/:bookId/ - Update an existing book completely
app.put(["/books/:bookId", "/books/:bookId/"], async (request, response) => {
    try {
        const bookId = parseBookId(request.params.bookId);
        if (bookId === null) {
            return response.status(400).json({ error: "bookId must be a positive whole number" });
        }

        const validationError = validateBookBody(request.body);
        if (validationError) {
            return response.status(400).json({ error: validationError });
        }

        const { title, author, price, pages } = request.body;
        const updateBookQuery = "UPDATE book SET title = ?, author = ?, price = ?, pages = ? WHERE id = ?;";
        const result = await db.run(updateBookQuery, [title.trim(), author.trim(), price, pages, bookId]);

        if (result.changes === 0) {
            return response.status(404).json({ error: "Book not found" });
        }

        response.status(200).json({ message: "Book updated" });
    } catch (error) {
        console.error(`Error updating book: ${error.message}`);
        response.status(500).json({ error: "Internal Server Error" });
    }
});

// DELETE /books/:bookId/ - Remove a book by ID
app.delete(["/books/:bookId", "/books/:bookId/"], async (request, response) => {
    try {
        const bookId = parseBookId(request.params.bookId);
        if (bookId === null) {
            return response.status(400).json({ error: "bookId must be a positive whole number" });
        }

        const deleteBookQuery = "DELETE FROM book WHERE id = ?;";
        const result = await db.run(deleteBookQuery, [bookId]);

        if (result.changes === 0) {
            return response.status(404).json({ error: "Book not found" });
        }

        response.status(200).json({ message: "Book deleted" });
    } catch (error) {
        console.error(`Error deleting book: ${error.message}`);
        response.status(500).json({ error: "Internal Server Error" });
    }
});

// Catch-all route handler for undefined paths (404 Not Found)
app.use((request, response) => {
    response.status(404).json({ error: "Route not found" });
});

// Global unhandled error handler
app.use((error, request, response, next) => {
    console.error(`Unhandled error: ${error.message}`);
    response.status(500).json({ error: "Internal Server Error" });
});
