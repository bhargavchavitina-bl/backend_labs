# Backend Development Fundamentals - Lab Reports

Comprehensive laboratory experiments, implementations, and documentation for the **Backend Development Fundamentals** course.

---

## Student Information

- **Student Name:** Ch. bhargav
- **Registration Number:** 252U1R1055
- **Branch / Section:** CSE
- **Course:** Backend Development Fundamentals
- **GitHub Repository:** [backend_labs](https://github.com/bhargavchavitina-bl/backend_labs)

---

## Lab Directory Index

| Lab | Title | Description | Technologies | Report Link |
| :---: | :--- | :--- | :--- | :---: |
| **Lab 01** | **Node.js and Express Server** | Introduction to backend servers using Node.js built-in `http` module and Express.js routing, status codes, and error handling. | Node.js, Express.js | [View Lab 01](./lab-01/) |
| **Lab 02** | **SQLite database and CRUD routes** | Connect an Express server to a SQLite database and expose create, read, update, and delete (CRUD) operations over HTTP. | Node.js, Express.js, SQLite, sqlite3 | [View Lab 02](./lab-02/) |
| **Lab 03** | **REST API, query parameters, validation, debugging** | Upgrades CRUD routes with search, sort, pagination, price range filters, strict validation, and Postman tests. | Node.js, Express.js, SQLite, sqlite3, Postman | [View Lab 03](./lab-03/) |

---

## Repository Structure

```plaintext
backend_labs/
├── .gitignore
├── README.md
├── lab-01/
│   ├── .gitignore
│   ├── package.json
│   ├── package-lock.json
│   ├── README.md
│   ├── server-http.js         # Built-in Node http server
│   ├── server.js              # Express application server
│   └── screenshots/           # Endpoint response screenshots
│       ├── home.png
│       ├── about.png
│       ├── time.png
│       └── not-found.png
├── lab-02/
│   ├── .gitignore
│   ├── package.json
│   ├── package-lock.json
│   ├── README.md
│   ├── seed.sql               # SQLite table definition and seed records
│   ├── books.db               # SQLite database file
│   ├── server.js              # Express server with RESTful CRUD endpoints
│   ├── test-api.js            # Automated verification test script
│   └── screenshots/           # CRUD response screenshots
│       ├── cli-before.png
│       ├── get-all.png
│       ├── get-one.png
│       ├── post.png
│       ├── put.png
│       ├── delete.png
│       ├── not-found.png
│       └── cli-after.png
└── lab-03/
    ├── .gitignore
    ├── package.json
    ├── package-lock.json
    ├── README.md
    ├── seed.sql               # SQLite table schema with NOT NULL constraints
    ├── books.db               # SQLite database file
    ├── server.js              # REST API server with query params and validation
    ├── lab-03.postman_collection.json # Postman test suite (30 requests)
    └── screenshots/           # Endpoint response screenshots
        ├── search.png
        ├── sort.png
        ├── pagination.png
        ├── price-range.png
        ├── post-created.png
        ├── put-updated.png
        ├── delete-deleted.png
        ├── validation-error.png
        ├── bad-price.png
        ├── not-found.png
        └── runner-results.png
```

---

## General Setup & Installation

Each lab experiment is self-contained within its respective directory. To set up and run any lab:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/bhargavchavitina-bl/backend_labs.git
   cd backend_labs
   ```

2. **Navigate into the desired lab directory:**
   ```bash
   cd lab-01
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Run the server:**
   - **For Lab 01:**
     ```bash
     node server.js        # Starts Express server
     # or: node server-http.js
     ```

Refer to the individual `README.md` file in the `lab-01` directory for full experiment details, API endpoint specifications, review questions, and screenshots.
