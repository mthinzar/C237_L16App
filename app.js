const express = require('express');
const mysql = require('mysql2');
const multer = require('multer');
const app = express();

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images'); // Directory to save uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage: storage });

// Create MySQL connection 
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'RP738964$',
  database: 'c237_studentlistapp'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// Set up view engine 
app.set('view engine', 'ejs');
//  enable static files 
app.use(express.static('public'));
// enable form processing for POST requests
app.use(express.urlencoded({ extended: false }));


// Define routes
app.get('/', (req, res) => {
  const sql = 'SELECT * FROM student';
  // Fetch data from MySQL
  connection.query(sql, (error, results) => {
    if (error) {
      console.error('Database query error:', error.message);
      return res.send('Error Retrieving students');
    }
    // Render HTML page with data
    res.render('index', { students: results });
  });
});

app.get('/student/:id', (req, res) => {
  const studentid = req.params.id;

  const sql = 'SELECT * FROM student WHERE studentid = ?';

  connection.query(sql, [studentid], (error, results) => {
    if (error) {
      console.error('Database query error:', error.message);
      return res.send('Error Retrieving student by ID');
    }

    if (results.length > 0) {
      res.render('student', { student: results[0] });
    } else {
      res.send('Student not found');
    }
  });
});

app.get('/addStudent', (req, res) => {
  res.render('addStudent');
});

app.post('/addStudent', upload.single('image'), (req, res) => {
  // Extract student data from the request body
  // const { name, dob, contact, image } = req.body;

  const { name, dob, contact } = req.body;
  let image;
  if (req.file) {
    image = req.file.filename; // Save only the filename
  } else {
    image = null;
  }

  const sql = `
        INSERT INTO student (name, dob, contact, image)
        VALUES (?, ?, ?, ?)
    `;

  // Insert the new student into the database
  connection.query(sql, [name, dob, contact, image], (error, results) => {
    if (error) {
      console.error("Error adding student:", error);
      res.send("Error adding student");
    } else {
      res.redirect('/');
    }
  });
});

// Edit student page
app.get('/editStudent/:id', (req, res) => {
  const studentid = req.params.id;

  const sql = 'SELECT * FROM student WHERE studentid = ?';

  connection.query(sql, [studentid], (error, results) => {
    if (error) {
      console.error('Database query error:', error.message);
      return res.send('Error retrieving student by ID');
    }

    if (results.length > 0) {
      const student = results[0];

      // Format DOB for <input type="date">
      if (student.dob) {
        student.dob = student.dob.toISOString().split('T')[0];
      }

      res.render('editStudent', { student: student });
    } else {
      res.send('Student not found');
    }
  });
});


// Update student
app.post('/editStudent/:id', upload.single('image'), (req, res) => {
  const studentid = req.params.id;

  const { name, dob, contact } = req.body;
  let image;
  if (req.file) {
    image = req.file.filename; // Save only the filename
  } else {
    image = null;
  }

  const sql = `
    UPDATE student 
    SET name = ?, dob = ?, contact = ?, image = ?
    WHERE studentid = ?
  `;

  connection.query(sql, [name, dob, contact, image, studentid], (error, results) => {
    if (error) {
      console.error('Error updating student:', error);
      return res.send('Error updating student');
    }

    res.redirect('/');
  });
});


// Delete student
app.get('/deleteStudent/:id', (req, res) => {
  const studentid = req.params.id;

  const sql = 'DELETE FROM student WHERE studentid = ?';

  connection.query(sql, [studentid], (error, results) => {
    if (error) {
      console.error('Error deleting student:', error);
      return res.send('Error deleting student');
    }

    res.redirect('/');
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`)); 