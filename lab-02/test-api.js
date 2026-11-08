const assert = require("assert");

const BASE_URL = "http://localhost:3000";

async function runTests() {
    console.log("=== Starting Automated API Verification for Lab 2 ===\n");

    // 1. GET /books/
    console.log("1. Testing GET /books/ ...");
    const resAll = await fetch(`${BASE_URL}/books/`);
    assert.strictEqual(resAll.status, 200, "GET /books/ should return 200");
    const books = await resAll.json();
    console.log(`   Fetched ${books.length} books. Status: 200 OK`);
    assert.strictEqual(books.length, 10, "Initial database should have 10 books");

    // 2. Trailing slash check: GET /books
    console.log("2. Testing GET /books (no trailing slash) ...");
    const resAllNoSlash = await fetch(`${BASE_URL}/books`);
    assert.strictEqual(resAllNoSlash.status, 200, "GET /books should return 200");
    console.log("   Status: 200 OK");

    // 3. GET /books/1/
    console.log("3. Testing GET /books/1/ ...");
    const resOne = await fetch(`${BASE_URL}/books/1/`);
    assert.strictEqual(resOne.status, 200, "GET /books/1/ should return 200");
    const bookOne = await resOne.json();
    console.log(`   Found book: "${bookOne.title}" by ${bookOne.author}. Status: 200 OK`);

    // 4. GET /books/999/ (Not Found)
    console.log("4. Testing GET /books/999/ (non-existent book) ...");
    const resNotFound = await fetch(`${BASE_URL}/books/999/`);
    assert.strictEqual(resNotFound.status, 404, "GET /books/999/ should return 404");
    const notFoundJson = await resNotFound.json();
    console.log(`   Response: ${JSON.stringify(notFoundJson)}. Status: 404 Not Found`);

    // 5. POST /books/ (Valid body)
    console.log("5. Testing POST /books/ ...");
    const newBook = {
        title: "Clean Architecture",
        author: "Robert C. Martin",
        price: 650,
        pages: 432
    };
    const resPost = await fetch(`${BASE_URL}/books/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBook)
    });
    assert.strictEqual(resPost.status, 201, "POST /books/ should return 201");
    const postData = await resPost.json();
    console.log(`   Response: ${JSON.stringify(postData)}. Status: 201 Created`);
    assert(postData.bookId, "Response must include new bookId");

    // Verify addition
    const resAllAfterPost = await fetch(`${BASE_URL}/books/`);
    const booksAfterPost = await resAllAfterPost.json();
    assert.strictEqual(booksAfterPost.length, 11, "Should have 11 books after insertion");
    console.log(`   Verified book count increased to ${booksAfterPost.length}`);

    // 6. POST /books/ with missing fields
    console.log("6. Testing POST /books/ with missing fields ...");
    const badBook = { title: "Incomplete Book" };
    const resMissing = await fetch(`${BASE_URL}/books/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(badBook)
    });
    assert.strictEqual(resMissing.status, 400, "Missing fields should return 400");
    const missingJson = await resMissing.json();
    console.log(`   Response: ${JSON.stringify(missingJson)}. Status: 400 Bad Request`);

    // 7. POST /books/ with malformed JSON
    console.log("7. Testing POST /books/ with malformed JSON ...");
    const resMalformed = await fetch(`${BASE_URL}/books/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{ bad json syntax "
    });
    assert.strictEqual(resMalformed.status, 400, "Malformed JSON should return 400");
    const malformedJson = await resMalformed.json();
    console.log(`   Response: ${JSON.stringify(malformedJson)}. Status: 400 Bad Request`);

    // 8. PUT /books/1/
    console.log("8. Testing PUT /books/1/ ...");
    const updatedBook = {
        title: "Designing Data-Intensive Applications (Updated Edition)",
        author: "Martin Kleppmann",
        price: 799,
        pages: 650
    };
    const resPut = await fetch(`${BASE_URL}/books/1/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedBook)
    });
    assert.strictEqual(resPut.status, 200, "PUT /books/1/ should return 200");
    const putData = await resPut.json();
    console.log(`   Response: ${JSON.stringify(putData)}. Status: 200 OK`);

    // Verify update
    const resCheckPut = await fetch(`${BASE_URL}/books/1/`);
    const checkPutJson = await resCheckPut.json();
    assert.strictEqual(checkPutJson.title, updatedBook.title, "Title should be updated");
    console.log(`   Verified updated title: "${checkPutJson.title}"`);

    // 9. PUT /books/999/ (Not Found)
    console.log("9. Testing PUT /books/999/ (non-existent id) ...");
    const resPut404 = await fetch(`${BASE_URL}/books/999/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedBook)
    });
    assert.strictEqual(resPut404.status, 404, "PUT /books/999/ should return 404");
    console.log("   Status: 404 Not Found");

    // 10. DELETE /books/1/
    console.log("10. Testing DELETE /books/1/ ...");
    const resDel = await fetch(`${BASE_URL}/books/1/`, { method: "DELETE" });
    assert.strictEqual(resDel.status, 200, "DELETE /books/1/ should return 200");
    const delData = await resDel.json();
    console.log(`   Response: ${JSON.stringify(delData)}. Status: 200 OK`);

    // Verify deletion
    const resCheckDel = await fetch(`${BASE_URL}/books/1/`);
    assert.strictEqual(resCheckDel.status, 404, "Deleted book should return 404 on GET");
    console.log("   Verified deleted book now returns 404 Not Found");

    // 11. DELETE /books/999/ (Not Found)
    console.log("11. Testing DELETE /books/999/ (non-existent id) ...");
    const resDel404 = await fetch(`${BASE_URL}/books/999/`, { method: "DELETE" });
    assert.strictEqual(resDel404.status, 404, "DELETE /books/999/ should return 404");
    console.log("   Status: 404 Not Found");

    // 12. Non-numeric ID check: GET /books/abc/
    console.log("12. Testing non-numeric ID GET /books/abc/ ...");
    const resBadId = await fetch(`${BASE_URL}/books/abc/`);
    assert.strictEqual(resBadId.status, 400, "Non-numeric ID should return 400");
    const badIdJson = await resBadId.json();
    console.log(`   Response: ${JSON.stringify(badIdJson)}. Status: 400 Bad Request`);

    // 13. SQL Injection check: GET /books/1%20OR%201=1/
    console.log("13. Testing SQL Injection prevention on ID ...");
    const resSqlInj = await fetch(`${BASE_URL}/books/1%20OR%201=1/`);
    assert.strictEqual(resSqlInj.status, 400, "SQL injection string should be rejected with 400");
    console.log("   Status: 400 Bad Request (Blocked safely)");

    // 14. Unknown route: GET /something-undefined
    console.log("14. Testing unknown route GET /something-undefined ...");
    const resUnknown = await fetch(`${BASE_URL}/something-undefined`);
    assert.strictEqual(resUnknown.status, 404, "Unknown route should return 404");
    const unknownJson = await resUnknown.json();
    console.log(`   Response: ${JSON.stringify(unknownJson)}. Status: 404 Not Found`);

    console.log("\n==============================================");
    console.log(">>> ALL 14 TESTS EXECUTED AND PASSED 100%! <<<");
    console.log("==============================================");
}

runTests().catch(err => {
    console.error("Test failed:", err);
    process.exit(1);
});
