require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const Student = require("./models/student");
const User = require("./models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = 3000;

// -------------------------------
// MONGODB CONNECTION
// -------------------------------

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("MongoDB connected successfully");
    })
    .catch((error) => {
        console.error("MongoDB connection error:", error);
    });

// -------------------------------
// MIDDLEWARE
// -------------------------------

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// -------------------------------
// FRONT-END ROUTE
// -------------------------------

app.get("/", (req, res) => {
    res.render("index");
});

// -------------------------------
// AUTHENTICATION MIDDLEWARE
// -------------------------------

function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "Access token required"
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                message: "Invalid or expired token"
            });
        }

        req.user = user;
        next();
    });
}

// -------------------------------
// USER REGISTRATION
// -------------------------------

app.post("/api/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required"
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword
        });

        await newUser.save();

        res.status(201).json({
            message: "User registered successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error registering user"
        });
    }
});

// -------------------------------
// USER LOGIN
// -------------------------------

app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                userId: user._id,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h"
            }
        );

        res.json({
            message: "Login successful",
            token
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error logging in"
        });
    }
});

// -------------------------------
// GET ALL STUDENTS
// -------------------------------

app.get("/api/students", authenticateToken, async (req, res) => {
    try {
        const students = await Student.find();

        res.json(students);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error fetching students"
        });
    }
});

// -------------------------------
// GET ONE STUDENT
// -------------------------------

app.get("/api/students/:id", authenticateToken, async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        res.json(student);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error fetching student"
        });
    }
});

// -------------------------------
// CREATE STUDENT
// -------------------------------

app.post("/api/students", authenticateToken, async (req, res) => {
    try {
        const { name, email, age, course } = req.body;

        if (!name || !email || !age || !course) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const newStudent = new Student({
            name,
            email,
            age,
            course
        });

        await newStudent.save();

        res.status(201).json({
            message: "Student created successfully",
            student: newStudent
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error creating student"
        });
    }
});

// -------------------------------
// UPDATE STUDENT
// -------------------------------

app.put("/api/students/:id", authenticateToken, async (req, res) => {
    try {
        const { name, email, age, course } = req.body;

        const student = await Student.findByIdAndUpdate(
            req.params.id,
            {
                name,
                email,
                age,
                course
            },
            {
                new: true
            }
        );

        if (!student) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        res.json({
            message: "Student updated successfully",
            student
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error updating student"
        });
    }
});

// -------------------------------
// DELETE STUDENT
// -------------------------------

app.delete("/api/students/:id", authenticateToken, async (req, res) => {
    try {
        const student = await Student.findByIdAndDelete(
            req.params.id
        );

        if (!student) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        res.json({
            message: "Student deleted successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Error deleting student"
        });
    }
});

// -------------------------------
// OLD FORM SUBMISSION
// -------------------------------

app.post("/submit", (req, res) => {
    const { name, email, age, course } = req.body;

    if (!name || !email || !age || !course) {
        return res.send(
            "<h1>Error: Please fill all fields.</h1>"
        );
    }

    if (age < 13 || age > 100) {
        return res.send(
            "<h1>Error: Please enter a valid age.</h1>"
        );
    }

    res.send(`
        <h1>Form Submitted Successfully!</h1>
        <p>Name: ${name}</p>
        <p>Email: ${email}</p>
        <p>Age: ${age}</p>
        <p>Course: ${course}</p>
    `);
});

// -------------------------------
// START SERVER
// -------------------------------

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});