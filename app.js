const express = require('express');
const app = express();
const mysql = require('mysql');
const path = require('path');
const bodyParser = require('body-parser');
const port = process.env.PORT || 3000;


// Configuring database connection
const connection = mysql.createConnection({
    host: process.env.RDS_HOSTNAME,
    user: process.env.RDS_USERNAME,
    password: process.env.RDS_PASSWORD,
    database: process.env.RDS_DB_NAME,
    port: process.env.RDS_PORT,
});

// Connecting to database
connection.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
    } else {
        console.log('Connected to the database');
    }
});

// Cross Origin (DO NOT DELETE)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Allows us to parse json responses (DO NOT DELETE)  
app.use(bodyParser.json());


// About page 
app.get('/about', (req, res) => {
    // Gets all entries from about table, then orders them in ascending order
    const query = 'SELECT * FROM About ORDER BY SPRINT_NUM DESC LIMIT 1';
    connection.query(query,(queryError, result) => {
        if (queryError) {
            console.error('Error executing query:', queryErr);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        } else {
            // Result will contain the most recent entry
            const newestPrimaryKey = result[0].SPRINT_NUM;
            res.status(200).json(result[0]);
            return;
        }
    })
});
  
// Returns all sponsors
app.get('/sponsors', (req, res) => {
    const query = 'SELECT * FROM SponsorCompany';
    connection.query(query,(queryError, result) => {
        if (queryError) {
            console.error('Error executing query:', queryErr);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        } else {
            // Result will contain the most recent entry
            res.status(200).json(result);
            return;
        }
    })
});

// Returns all applications with an associated sponsor
app.get('/applications', (req, res) => {
    const { sponsorID } = req.query;
  
    // Check if sponsorID is provided
    if (!sponsorID) {
      return res.status(400).json({ error: 'Missing sponsorID parameter' });
    }
  
    // SQL query to retrieve applications based on sponsorID
    const sql = 'SELECT * FROM Application WHERE SPONSOR_ID = ?';
  
    // Execute the query
    connection.query(sql, [sponsorID], (error, results) => {
      if (error) {
        console.error('Error executing query:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
  
      // Send the results as JSON response
      res.json(results);
    });
  });
       
// Takes in a new user for the database  
app.post('/users', (req, res) => {
    const { USER_ID, USER_TYPE, EMAIL } = req.body;
    
    // Check if required fields are provided
    if (!USER_ID || !USER_TYPE || !EMAIL) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // SQL query to insert data into the Users table
    const sql = 'INSERT INTO Users (USER_ID, USER_TYPE, EMAIL) VALUES (?, ?, ?)';
    
    // Execute the query
    connection.query(sql, [USER_ID, USER_TYPE, EMAIL], (error, results) => {
        if (error) {
        console.error('Error inserting user:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
        }
    
        // Send a success response
        res.json({ message: 'User added to the Users table successfully', result: results });
    });
});
      
// POST endpoint to add data to the Application table (NEED TO PROTECT AGAINST SQL INJECTION)
app.post('/applications', (req, res) => {
    const { userId, sponsorId, question1, question2 } = req.body;

    // Check if required fields are provided
    if (!userId || !sponsorId || !question1 || !question2) {
    return res.status(400).json({ error: 'Missing required fields' });
    }

    // SQL query to insert data into the Application table
    const sql = 'INSERT INTO Application (USER_ID, SPONSOR_ID, QUESTION_1, QUESTION_2) VALUES (?, ?, ?, ?)';

    // Execute the query
    connection.query(sql, [userId, sponsorId, question1, question2], (error, results) => {
    if (error) {
        console.error('Error executing query:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }

    // Send a success response
    res.json({ message: 'Data added to the Application table successfully', result: results });
    });
});

// Takes in a new driver for database
app.post('/drivers', (req, res) => {
    const { USER_ID, SPONSOR_ID } = req.body;

    // Check if required fields are provided
    if (!USER_ID || !SPONSOR_ID) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Query to get the most recent driverId
    const getDriverIdQuery = 'SELECT MAX(DRIVER_ID) AS MAX_DRIVER_ID FROM Drivers';

    // Execute query to get the most recent driverId
    connection.query(getDriverIdQuery, (error, results) => {
        if (error) {
            console.error('Error getting max driver ID:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        let NEW_DRIVER_ID = 1; // Default to 1 if no drivers exist yet
        if (results[0].MAX_DRIVER_ID) {
            NEW_DRIVER_ID = results[0].MAX_DRIVER_ID + 1; // Increment driverId
        }

        // SQL query to insert data into the Drivers table
        const insertDriverQuery = 'INSERT INTO Drivers (DRIVER_ID, USER_ID, SPONSOR_ID, POINTS) VALUES (?, ?, ?, ?)';

        // Execute the query
        connection.query(insertDriverQuery, [NEW_DRIVER_ID, USER_ID, SPONSOR_ID, 0], (error, results) => {
            if (error) {
                console.error('Error inserting driver:', error);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            // Send a success response
            res.json({ message: 'Driver added to the Drivers table successfully', result: results });
        });
    });
});

// HOME PAGE 
app.get('/', (req, res) => {
  res.send('Hello, Express!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
