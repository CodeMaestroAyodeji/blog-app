const express = require("express");
const mysql = require("mysql2");
const path = require("path");

const app = express();
const port = 4000;

// Set up MySQL connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "blog_app"
});

db.connect(err => {
    if (err) throw err;
    console.log("MySQL connected...");
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/public", express.static(path.join(__dirname, "../client/public")));

// Routes
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "../client/views/index.html")));
app.get("/home", (req, res) => res.sendFile(path.join(__dirname, "../client/views/home.html")));

app.post("/home", (req, res) => {
    const { blogTitle, blogDes } = req.body;
    const sql = "INSERT INTO blogs (title, description) VALUES (?, ?)";
    
    db.query(sql, [blogTitle, blogDes], (err) => {
        if (err) {
            console.error("Error inserting blog:", err);
            return res.status(500).send("Error saving blog.");
        }
        res.redirect("/home");  // Redirect to display all blogs after insertion
    });
});

app.get("/getBlogs", (req, res) => {
    const sql = "SELECT * FROM blogs ORDER BY created_at DESC";
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching blogs:", err);
            return res.status(500).json({ error: "Error fetching blogs." });
        }
        res.json(results);
    });
});

// Start server
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
