const express = require("express");

const app = express();
const PORT = 3000;

// Temporary server-side storage
let students = [
    {
        id: 1,
        name: "Demo Student",
        email: "demo@example.com",
        age: 20,
        course: "Web Development"
    }
];

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
// RESTFUL API - GET ALL STUDENTS
// -------------------------------

app.get("/api/students", (req, res) => {
    res.json(students);
});


// -------------------------------
// RESTFUL API - GET ONE STUDENT
// -------------------------------

app.get("/api/students/:id", (req, res) => {

    const id = Number(req.params.id);

    const student = students.find(
        student => student.id === id
    );

    if (!student) {
        return res.status(404).json({
            message: "Student not found"
        });
    }

    res.json(student);
});


// -------------------------------
// RESTFUL API - CREATE STUDENT
// -------------------------------

app.post("/api/students", (req, res) => {

    const { name, email, age, course } = req.body;

    if (!name || !email || !age || !course) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }

    const newStudent = {
        id: students.length + 1,
        name,
        email,
        age,
        course
    };

    students.push(newStudent);

    res.status(201).json({
        message: "Student created successfully",
        student: newStudent
    });
});


// -------------------------------
// RESTFUL API - UPDATE STUDENT
// -------------------------------

app.put("/api/students/:id", (req, res) => {

    const id = Number(req.params.id);

    const student = students.find(
        student => student.id === id
    );

    if (!student) {
        return res.status(404).json({
            message: "Student not found"
        });
    }

    const { name, email, age, course } = req.body;

    student.name = name || student.name;
    student.email = email || student.email;
    student.age = age || student.age;
    student.course = course || student.course;

    res.json({
        message: "Student updated successfully",
        student
    });
});


// -------------------------------
// RESTFUL API - DELETE STUDENT
// -------------------------------

app.delete("/api/students/:id", (req, res) => {

    const id = Number(req.params.id);

    const studentExists = students.some(
        student => student.id === id
    );

    if (!studentExists) {
        return res.status(404).json({
            message: "Student not found"
        });
    }

    students = students.filter(
        student => student.id !== id
    );

    res.json({
        message: "Student deleted successfully"
    });
});


// -------------------------------
// OLD FORM SUBMISSION
// -------------------------------

app.post("/submit", (req, res) => {

    const { name, email, age, course } = req.body;

    if (!name || !email || !age || !course) {
        return res.send("<h1>Error: Please fill all fields.</h1>");
    }

    if (age < 13 || age > 100) {
        return res.send("<h1>Error: Please enter a valid age.</h1>");
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