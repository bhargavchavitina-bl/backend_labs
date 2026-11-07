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

---

## Repository Structure

```plaintext
backend_labs/
├── .gitignore
├── README.md
└── lab-01/
    ├── .gitignore
    ├── package.json
    ├── package-lock.json
    ├── README.md
    ├── server-http.js         # Built-in Node http server
    ├── server.js              # Express application server
    └── screenshots/           # Endpoint response screenshots
        ├── home.png
        ├── about.png
        ├── time.png
        └── not-found.png
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
