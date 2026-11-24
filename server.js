require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();

const origins = (process.env.CLIENT_ORIGINS || "")
    .split(",")
    .map(value => value.trim())
    .filter(Boolean);

app.use(cors({ origin: origins.length ? origins : true }));
app.use(express.json());

// API Guide
app.get("/", (req, res) => {
    res.send(`
        <h1>Carelady's Study Support Hub API</h1>

        <p>
            This API manages study support requests.
            It allows users to create, view, update and delete records.
        </p>
        <p><strong>Student Number:</strong>202512575</p>

<p><strong>Live API URL:</strong> To be provided after deployment.</p>

<p><strong>Health Check:</strong> <a href="/health">/health</a></p>

<p><strong>View Records:</strong> <a href="/api/records">/api/records</a></p>

        <h2>Available Endpoints</h2>

        <table border="1" cellpadding="8">
            <tr>
                <th>Method</th>
                <th>Endpoint</th>
                <th>Purpose</th>
            </tr>
            <tr><td>GET</td><td>/</td><td>API documentation</td></tr>
            <tr><td>GET</td><td>/health</td><td>Check server and database</td></tr>
            <tr><td>GET</td><td>/api/records</td><td>View all records</td></tr>
            <tr><td>GET</td><td>/api/records/:id</td><td>View one record</td></tr>
            <tr><td>POST</td><td>/api/records</td><td>Create a record</td></tr>
            <tr><td>PUT</td><td>/api/records/:id</td><td>Update a record</td></tr>
            <tr><td>DELETE</td><td>/api/records/:id</td><td>Delete a record</td></tr>
        </table>

        <h2>Required Input Fields</h2>
        <ul>
            <li>title: 3 to 80 characters</li>
            <li>category: 2 to 40 characters</li>
            <li>description: 5 to 300 characters</li>
            <li>status: Pending, In progress or Completed</li>
        </ul>

        <h2>Example JSON Request</h2>
        <pre>
{
    "title": "Mathematics Assistance",
    "category": "Academic",
    "description": "I need help with algebra.",
    "status": "Pending"
}
        </pre>

        <h2>HTTP Status Codes</h2>
        <ul>
            <li>200 - Successful request</li>
            <li>201 - Record created</li>
            <li>400 - Invalid input</li>
            <li>404 - Record not found</li>
            <li>500 - Internal server error</li>
            <li>503 - Database unavailable</li>
        </ul>
    `);
});

// Database health check
app.get("/health", async (req, res, next) => {
    try {
        await pool.query("SELECT 1");
        res.status(200).json({
            message: "Server and database are working."
        });
    } catch (error) {
        res.status(503).json({
            message: "Database connection failed."
        });
    }
});

// Records routes
app.use("/api/records", require("./routes/records"));

// Unknown routes
app.use((req, res) => {
    res.status(404).json({
        message: "Route not found."
    });
});

// Error handling
app.use((error, req, res, next) => {
    console.error(error);

    if (error instanceof SyntaxError && error.status === 400) {
        return res.status(400).json({
            message: "Invalid JSON."
        });
    }

    res.status(500).json({
        message: "Internal server error."
    });
});

const port = process.env.PORT || 3000;

app.listen(port, "0.0.0.0", () => {
    console.log(`Server listening on port ${port}`);
});