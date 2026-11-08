const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
const PORT = process.env.PORT || 3000;
const dbPath = path.join(__dirname, "books.db");

let db = null;

// Initialize database connection once at startup
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
        console.error(`Database connection error: ${error.message}`);
        process.exit(1);
    }
};

initializeDatabaseAndServer();

// Body parser middleware
app.use(express.json());

// Whitelist configuration for sorting
const ALLOWED_COLUMNS = ["id", "title", "author", "price", "pages"];
const ALLOWED_DIRECTIONS = ["ASC", "DESC"];
const MAX_LIMIT = 100;
const MAX_INT_PRICE = 2147483647;

// Helper to validate and parse a positive integer ID parameter
const parseBookId = (paramValue) => {
    const id = Number(paramValue);
    if (Number.isInteger(id) && id > 0) {
        return id;
    }
    return null;
};

// Helper to parse query parameter integer with bounds
const parseQueryInteger = (val, paramName, defaultValue, min, max) => {
    if (val === undefined || val === "") {
        return defaultValue;
    }
    const parsed = Number(val);
    if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
        throw new Error(`${paramName} must be a whole number between ${min} and ${max}`);
    }
    return parsed;
};

// Helper to validate POST / PUT request body
const validateBookBody = (body) => {
    if (!body || typeof body !== "object") {
        return "Request body must be a valid JSON object";
    }

    const { title, author, price, pages } = body;

    if (typeof title !== "string" || title.trim().length === 0) {
        return "title is required and must be non-empty text";
    }

    if (typeof author !== "string" || author.trim().length === 0) {
        return "author is required and must be non-empty text";
    }

    if (typeof price !== "number" || !Number.isInteger(price) || price < 0) {
        return "price is required and must be a whole number, zero or more";
    }

    if (typeof pages !== "number" || !Number.isInteger(pages) || pages < 0) {
        return "pages is required and must be a whole number, zero or more";
    }

    return null;
};

// GET /books/ - List books with search, sort, pagination, and price range filters
app.get(["/books", "/books/"], async (request, response, next) => {
    try {
        const query = request.query;

        // 1. Search text filter (default empty)
        const searchQ = typeof query.search_q === "string" ? query.search_q : "";

        // 2. Sorting column (whitelist check)
        const rawOrderBy = query.order_by !== undefined ? String(query.order_by).toLowerCase() : "id";
        if (!ALLOWED_COLUMNS.includes(rawOrderBy)) {
            return response.status(400).json({
                message: `order_by must be one of: ${ALLOWED_COLUMNS.join(", ")}`
            });
        }
        const orderBy = rawOrderBy;

        // 3. Sorting direction (whitelist check)
        const rawOrder = query.order !== undefined ? String(query.order).toUpperCase() : "ASC";
        if (!ALLOWED_DIRECTIONS.includes(rawOrder)) {
            return response.status(400).json({
                message: "order must be ASC or DESC"
            });
        }
        const order = rawOrder;

        // 4. Limit and Offset validation
        let limit, offset, minPrice, maxPrice;
        try {
            limit = parseQueryInteger(query.limit, "limit", 10, 1, MAX_LIMIT);
            offset = parseQueryInteger(query.offset, "offset", 0, 0, MAX_INT_PRICE);
            minPrice = parseQueryInteger(query.min_price, "min_price", 0, 0, MAX_INT_PRICE);
            maxPrice = parseQueryInteger(query.max_price, "max_price", MAX_INT_PRICE, 0, MAX_INT_PRICE);
        } catch (valErr) {
            return response.status(400).json({ message: valErr.message });
        }

        // 5. Min price vs Max price logic
        if (minPrice > maxPrice) {
            return response.status(400).json({
                message: "min_price must not be greater than max_price"
            });
        }

        // Escape SQL LIKE wildcard characters to ensure exact literal substring matching
        const escapedSearch = searchQ.replace(/[\\%_]/g, "\\$&");

        // Parameterized query: order_by and order are safely whitelisted above
        const getBooksQuery = `
            SELECT * FROM book
            WHERE title LIKE ? ESCAPE '\\'
              AND price BETWEEN ? AND ?
            ORDER BY ${orderBy} ${order}
            LIMIT ? OFFSET ?;
        `;

        const queryParams = [`%${escapedSearch}%`, minPrice, maxPrice, limit, offset];
        const books = await db.all(getBooksQuery, queryParams);
        response.status(200).json(books);
    } catch (error) {
        next(error);
    }
});

// GET /books/:bookId/ - Retrieve a single book by ID
app.get(["/books/:bookId", "/books/:bookId/"], async (request, response, next) => {
    try {
        const bookId = parseBookId(request.params.bookId);
        if (bookId === null) {
            return response.status(400).json({ message: "bookId must be a positive whole number" });
        }

        const getBookQuery = "SELECT * FROM book WHERE id = ?;";
        const book = await db.get(getBookQuery, [bookId]);

        if (!book) {
            return response.status(404).json({ message: "Book not found" });
        }

        response.status(200).json(book);
    } catch (error) {
        next(error);
    }
});

// POST /books/ - Add a new book
app.post(["/books", "/books/"], async (request, response, next) => {
    try {
        const validationError = validateBookBody(request.body);
        if (validationError) {
            return response.status(400).json({ message: validationError });
        }

        const { title, author, price, pages } = request.body;
        const addBookQuery = "INSERT INTO book (title, author, price, pages) VALUES (?, ?, ?, ?);";
        const result = await db.run(addBookQuery, [title.trim(), author.trim(), price, pages]);

        response.status(201).json({
            id: result.lastID,
            message: "Book added"
        });
    } catch (error) {
        next(error);
    }
});

// PUT /books/:bookId/ - Replace all fields of an existing book
app.put(["/books/:bookId", "/books/:bookId/"], async (request, response, next) => {
    try {
        const bookId = parseBookId(request.params.bookId);
        if (bookId === null) {
            return response.status(400).json({ message: "bookId must be a positive whole number" });
        }

        const validationError = validateBookBody(request.body);
        if (validationError) {
            return response.status(400).json({ message: validationError });
        }

        const { title, author, price, pages } = request.body;
        const updateBookQuery = `
            UPDATE book
            SET title = ?, author = ?, price = ?, pages = ?
            WHERE id = ?;
        `;
        const result = await db.run(updateBookQuery, [title.trim(), author.trim(), price, pages, bookId]);

        if (result.changes === 0) {
            return response.status(404).json({ message: "Book not found" });
        }

        response.status(200).json({ message: "Book updated" });
    } catch (error) {
        next(error);
    }
});

// DELETE /books/:bookId/ - Delete an existing book by ID
app.delete(["/books/:bookId", "/books/:bookId/"], async (request, response, next) => {
    try {
        const bookId = parseBookId(request.params.bookId);
        if (bookId === null) {
            return response.status(400).json({ message: "bookId must be a positive whole number" });
        }

        const deleteBookQuery = "DELETE FROM book WHERE id = ?;";
        const result = await db.run(deleteBookQuery, [bookId]);

        if (result.changes === 0) {
            return response.status(404).json({ message: "Book not found" });
        }

        response.status(200).json({ message: "Book deleted" });
    } catch (error) {
        next(error);
    }
});

// Catch-all handler for undefined paths (404 Not Found)
app.use((request, response) => {
    response.status(404).json({ message: "Route not found" });
});

// Global error-handling middleware
app.use((error, request, response, next) => {
    // Malformed JSON parsing error
    if (error.type === "entity.parse.failed" || (error instanceof SyntaxError && error.status === 400 && "body" in error)) {
        return response.status(400).json({ message: "Request body is not valid JSON" });
    }

    const statusCode = error.status || 500;
    if (statusCode === 500) {
        console.error(`Internal error: ${error.message}`);
        return response.status(500).json({ message: "Internal server error" });
    }

    response.status(statusCode).json({ message: error.message });
});
