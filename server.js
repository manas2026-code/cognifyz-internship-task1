const express = require("express");

const app = express();
const PORT = 3000;

// Temporary server-side storage
const students = [];

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

// Show registration form
app.get("/", (req, res) => {
    res.render("index");
});

// Handle form submission
app.post("/submit", (req, res) => {

    const { name, email, age, course } = req.body;

    // Server-side validation
    if (!name || !email || !age || !course) {
        return res.send("<h1>Error: Please fill all fields.</h1>");
    }

    if (age < 13 || age > 100) {
        return res.send("<h1>Error: Please enter a valid age.</h1>");
    }

    // Store validated data temporarily
    students.push({
        name,
        email,
        age,
        course
    });

    res.send(`
        <h1>Form Submitted Successfully!</h1>
        <p>Name: ${name}</p>
        <p>Email: ${email}</p>
        <p>Age: ${age}</p>
        <p>Course: ${course}</p>
    `);
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});