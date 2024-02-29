const express = require('express');
const app = express();
const mysql = require('mysql');
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

// Takes in a new driver for database, sponsor and points will be initially empty
app.post('/drivers', (req, res) => {
    const { USER_ID } = req.body;
    
    // Check if required fields are provided
    if (!USER_ID) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Increment the driver ID based on the most recent driver ID
    let sql = 'SELECT MAX(DRIVER_ID) AS MAX_DRIVER_ID FROM Drivers';
    connection.query(sql, (error, results) => {
        if (error) {
            console.error('Error retrieving max driver ID:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        
        let MAX_DRIVER_ID = results[0].MAX_DRIVER_ID || 0;
        const DRIVER_ID = MAX_DRIVER_ID + 1;
        
        // Initialize sponsor ID to null
        const SPONSOR_ID = null;
        
        // Initialize points to 0
        const POINTS = 0;
        
        // SQL query to insert data into the Drivers table
        sql = 'INSERT INTO Drivers (DRIVER_ID, USER_ID, SPONSOR_ID, POINTS) VALUES (?, ?, ?, ?)';
        
        // Execute the query
        connection.query(sql, [DRIVER_ID, USER_ID, SPONSOR_ID, POINTS], (error, results) => {
            if (error) {
                console.error('Error inserting driver:', error);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
            
            // Send a success response
            res.json({ message: 'Driver added to the Drivers table successfully', result: results });
        });
    });
});

// Update a driver's information
app.patch('/drivers/:DRIVER_ID', (req, res) => {
    const DRIVER_ID = req.params.DRIVER_ID;
    const { SPONSOR_ID, POINTS } = req.query;
    
    // Check if at least one field is provided for update
    if (!SPONSOR_ID && POINTS === undefined) {
        return res.status(400).json({ error: 'No fields provided for update' });
    }
    
    // Construct SET clause dynamically based on provided fields
    let setClause = '';
    const values = [];
    if (SPONSOR_ID !== undefined) {
        setClause += 'SPONSOR_ID = ?, ';
        values.push(SPONSOR_ID);
    }
    if (POINTS !== undefined) {
        setClause += 'POINTS = ?, ';
        values.push(POINTS);
    }
    // Remove trailing comma and space from SET clause
    setClause = setClause.slice(0, -2);
    
    // SQL query to update driver's information
    const sql = `UPDATE Drivers SET ${setClause} WHERE DRIVER_ID = ?`;
    values.push(DRIVER_ID);
    
    // Execute the query
    connection.query(sql, values, (error, results) => {
        if (error) {
            console.error('Error updating driver:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Driver not found' });
        }
        
        // Send a success response
        res.json({ message: 'Driver information updated successfully', result: results });
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
