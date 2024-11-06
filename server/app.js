const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const path = require("path");
const session = require("express-session");

const app = express();
const port = 4000;

// Set up MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "blog_app",
});

db.connect((err) => {
  if (err) throw err;
  console.log("MySQL connected...");
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/public", express.static(path.join(__dirname, "../client/public")));

// Set up session middleware
app.use(
  session({
    secret: "your-secret-key", // use a unique secret
    resave: false,
    saveUninitialized: true,
  })
);

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "brimtechconcepts@gmail.com",
    pass: "xwrtmhfrigjsuzek",
  },
});

// Routes

// Main routes
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "../client/views/index.html")));
app.get("/home", (req, res) => res.sendFile(path.join(__dirname, "../client/views/home.html")));

// Blog creation, editing, and deletion

// Create a new blog post
app.post("/home", (req, res) => {
  const { blogTitle, blogDes } = req.body;
  const sql = "INSERT INTO blogs (title, description) VALUES (?, ?)";
  
  db.query(sql, [blogTitle, blogDes], (err) => {
    if (err) {
      console.error("Error inserting blog:", err);
      return res.status(500).send("Error saving blog.");
    }
    res.redirect("/home"); // Redirect to display all blogs after insertion
  });
});

// Fetch all blogs
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

// Route to render the edit blog page
app.get('/editBlog/:id', (req, res) => {
  const blogId = req.params.id;
  const sql = 'SELECT * FROM blogs WHERE id = ?';

  db.query(sql, [blogId], (err, results) => {
      if (err || results.length === 0) {
          return res.status(404).send('Blog not found');
      }

      const blog = results[0];
      res.send(`
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Edit ${blog.title}</title>
          </head>
          <body>
              <header><h1>Blog App</h1></header>
              <main>
                  <h2>Edit Blog</h2>
                  <form action="/editBlog/${blog.id}" method="POST">
                      <label for="bTitle">Blog Title</label>
                      <input type="text" id="bTitle" name="blogTitle" value="${blog.title}" required><br>
                      
                      <label for="bDes">Blog Description</label>
                      <textarea id="bDes" name="blogDes" rows="6" required>${blog.description}</textarea><br>

                      <input type="submit" value="Update Blog">
                  </form>
              </main>
              <footer>
                  <p>&#169; Blog App | All Rights Reserved</p>
              </footer>
          </body>
          </html>
      `);
  });
});

// Route to handle form submission and update the blog
app.post('/editBlog/:id', (req, res) => {
  const blogId = req.params.id;
  const { blogTitle, blogDes } = req.body;

  const sql = 'UPDATE blogs SET title = ?, description = ? WHERE id = ?';

  db.query(sql, [blogTitle, blogDes, blogId], (err, result) => {
      if (err) {
          return res.status(500).send('Error updating blog');
      }
      res.redirect('/home');  // Redirect to home after updating
  });
});

// View a single blog
app.get('/viewBlog/:id', (req, res) => {
  const blogId = req.params.id;
  const sql = 'SELECT * FROM blogs WHERE id = ?';

  db.query(sql, [blogId], (err, results) => {
      if (err || results.length === 0) {
          return res.status(404).send('Blog not found');
      }

      const blog = results[0];
      res.send(`
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>${blog.title}</title>
          </head>
          <body>
              <header><h1>Blog App</h1></header>
              <main>
                  <h2>${blog.title}</h2>
                  <p>${blog.description}</p>
              </main>
              <footer>
                  <p>&#169; Blog App | All Rights Reserved</p>
              </footer>
          </body>
          </html>
      `);
  });
});


// Delete a blog
app.delete("/deleteBlog/:id", (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM blogs WHERE id = ?";
  
  db.query(sql, [id], (err) => {
    if (err) {
      console.error("Error deleting blog:", err);
      return res.status(500).send("Error deleting blog.");
    }
    res.send("Blog deleted successfully!");
  });
});

// Signup route with email verification
app.post("/signup", (req, res) => {
  const { username, email, password } = req.body;

  // Hash password
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) return res.status(500).send("Error hashing password");

    // Generate a verification token
    const token = crypto.randomBytes(32).toString("hex");

    const sql = "INSERT INTO users (username, email, password, isVerified, verificationToken) VALUES (?, ?, ?, ?, ?)";
    db.query(sql, [username, email, hashedPassword, false, token], (err) => {
      if (err) return res.status(500).send("Error saving user");

      // Send verification email
      const verificationUrl = `http://localhost:${port}/verify-email?token=${token}`;
      const mailOptions = {
        from: "brimtechconcepts@gmail.com",
        to: email,
        subject: "Verify Your Email",
        html: `<p>Click <a href="${verificationUrl}">here</a> to verify your email.</p>`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) return res.status(500).send("Error sending verification email");
        res.send("Signup successful! Please check your email to verify your account.");
      });
    });
  });
});

// Login route
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const sql = "SELECT * FROM users WHERE username = ?";
  db.query(sql, [username], (err, results) => {
    if (err) return res.status(500).send("Error logging in");
    if (results.length === 0) return res.status(400).send("User not found");

    const user = results[0];

    // Check if email is verified
    if (!user.isVerified) return res.status(400).send("Please verify your email before logging in");

    // Compare hashed passwords
    bcrypt.compare(password, user.password, (err, match) => {
      if (err) return res.status(500).send("Error comparing passwords");
      if (!match) return res.status(400).send("Incorrect password");

      req.session.user = { id: user.id, username: user.username };
      res.redirect("/home");
    });
  });
});

// Email verification route
app.get("/verify-email", (req, res) => {
  const { token } = req.query;

  const sql = "UPDATE users SET isVerified = true WHERE verificationToken = ?";
  db.query(sql, [token], (err, result) => {
    if (err || result.affectedRows === 0) {
      return res.status(400).send("Invalid or expired token");
    }
    res.send("Email verified successfully! You can now log in.");
  });
});

// Reset password route
app.post("/reset-password", (req, res) => {
  const { email } = req.body;
  const token = crypto.randomBytes(32).toString("hex");

  const sql = "UPDATE users SET resetToken = ? WHERE email = ?";
  db.query(sql, [token, email], (err, result) => {
    if (err || result.affectedRows === 0) return res.status(400).send("User not found");

    const resetUrl = `http://localhost:${port}/reset-password-form?token=${token}`;
    const mailOptions = {
      from: "brimtechconcepts@gmail.com",
      to: email,
      subject: "Password Reset",
      html: `<p>Click <a href="${resetUrl}">here</a> to reset your password.</p>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) return res.status(500).send("Error sending password reset email");
      res.send("Password reset email sent! Please check your email.");
    });
  });
});

// Render Reset Password Form
app.get("/reset-password-form", (req, res) => {
  const { token } = req.query;
  res.sendFile(path.join(__dirname, "../client/views/reset-password.html"));
});

// Update Password in Database
app.post("/reset-password-form", (req, res) => {
  const { token, newPassword } = req.body;

  bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
    if (err) return res.status(500).send("Error hashing password");

    const sql = "UPDATE users SET password = ?, resetToken = NULL WHERE resetToken = ?";
    db.query(sql, [hashedPassword, token], (err, result) => {
      if (err || result.affectedRows === 0) return res.status(400).send("Invalid or expired token");
      res.send("Password has been reset successfully! You can now log in.");
    });
  });
});

// Start server
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
