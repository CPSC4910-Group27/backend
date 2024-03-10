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
            console.error('Error executing query:', queryError);
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

// Return current user information
app.get('/user', (req, res) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ error: 'Authorization token not provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error('Error decoding token:', err);
            return res.status(401).json({ error: 'Invalid token' });
        }

        const { sub: userId, userType, email} = decoded;

        // Respond with user information
        res.status(200).json({ userId, userType, email});
    });
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

// get all sponsor users
app.get('/sponsorusers', async (req, res) => {
    const sponsorID = req.query.sponsorID;
    // RETURN ALL SPONSORS
    if (!sponsorID) {
        query = 'SELECT * FROM Sponsors';
        connection.query(query,(queryError, result)=> {
            if(queryError){
                console.error('Error fetching sponsors:', queryError);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
            else{
                res.status(200).json(result);
                return;
            }
        });
    }
    else{
        // RETURNS ALL SPONSORs ASSOCIATED WITH SPECIFIC SPONSOR
        query = 'SELECT * FROM Sponsors WHERE SPONSOR_ID = ' + sponsorID.toString();
        connection.query(query,(queryError, result)=> {
            if(queryError){
                console.error('Error fetching sponsors associated with ${sponsorID}:', queryError);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
            else{
                res.status(200).json(result);
                return;
            }
        });
    }
});
  
// get all drivers
app.get('/drivers', async (req, res) => {
    const sponsorID = req.query.sponsorID;
    // RETURN ALL DRIVERS
    if (!sponsorID) {
        query = 'SELECT * FROM DriverSponsorships';
        connection.query(query,(queryError, result)=> {
            if(queryError){
                console.error('Error fetching drivers:', queryError);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
            else{
                res.status(200).json(result);
                return;
            }
        });
    }
    else{
        // RETURNS ALL DRIVERs ASSOCIATED WITH SPECIFIC SPONSOR
        query = 'SELECT * FROM DriverSponsorships WHERE SPONSOR_ID = ' + sponsorID.toString();
        connection.query(query,(queryError, result)=> {
            if(queryError){
                console.error('Error fetching drivers associated with ${sponsorID}:', queryError);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
            else{
                res.status(200).json(result);
                return;
            }
        });
    }
});

// get all sponsor applications
app.get('/applications', async (req, res) => {
    const sponsorID = req.query.sponsorID;
    // RETURN ALL APPLICATIONS
    if (!sponsorID) {
        query = 'SELECT * FROM Application';
        connection.query(query,(queryError, result)=> {
            if(queryError){
                console.error('Error fetching applications:', queryError);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
            else{
                res.status(200).json(result);
                return;
            }
        });
    }
    else{
        // RETURNS ALL APPLICATIONs ASSOCIATED WITH SPECIFIC SPONSOR
        query = 'SELECT * FROM Application WHERE SPONSOR_ID = ' + sponsorID.toString();
        connection.query(query,(queryError, result)=> {
            if(queryError){
                console.error('Error fetching application associated with ${sponsorID}:', queryError);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
            else{
                res.status(200).json(result);
                return;
            }
        });
    }
});

// Takes in a new user for the database  
app.post('/users', (req, res) => {
    const {USER_TYPE, EMAIL, USERNAME} = req.body;

    // Check if required fields are provided
    if (!USER_TYPE|| !EMAIL || !USERNAME) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // SQL query to insert data into the Users table
    const sql = 'INSERT INTO Users , USER_TYPE, EMAIL) VALUES (?, ?, ?)';
    
    // Execute the query
    connection.query(sql, [USER_ID, USER_TYPE, EMAIL], (error, results) => {
        if (error) {
        console.error('Error inserting user:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
        }
    
        // Send a success response
        res.json({ message: 'User added to the Users table successfully', result: results });
        return;
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
    const { DRIVER_ID } = req.body;

    // Check if required fields are provided
    if (!DRIVER_ID) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // SQL query to insert data into the Drivers table
    const sql = 'INSERT INTO Drivers (DRIVER_ID) VALUES (?)';

    // Execute the query
    connection.query(sql, [DRIVER_ID], (error, results) => {
        if (error) {
            console.error('Error executing query:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        // Send a success response
        res.json({ message: 'Driver added to the Drivers table successfully'});
    });
});

// Update a driver's information
app.patch('/drivers/:USER_ID', (req, res) => {
    const USER_ID = req.params.USER_ID;
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
    const sql = `UPDATE Drivers SET ${setClause} WHERE USER_ID = ?`;
    values.push(USER_ID);
    
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
        res.json({ message: 'Driver information updated successfully'});
    });
});

// Takes in a new sponsor to Sponsors table
app.post('/sponsors', (req, res) => {
    const { SPONSOR_ADMIN_ID, USER_ID } = req.body; // Assuming you have SPONSOR_ADMIN_ID and USER_ID in the request body

    // Check if required fields are provided
    if (!SPONSOR_ADMIN_ID || !USER_ID) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // SQL query to fetch sponsorId based on admin's userId
    const sponsorIDQuery = 'SELECT SPONSOR_ID FROM Sponsors WHERE USER_ID = ?';

    // Execute the query
    connection.query(sponsorIDQuery, [SPONSOR_ADMIN_ID], (error, results) => {
        if (error) {
            console.error('Error fetching sponsor ID:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Sponsor admin not found' });
        }

        const sponsorId = results[0].sponsorId;

        // SQL query to insert data into the Sponsors table
        const insertSponsorQuery = 'INSERT INTO Sponsors (USER_ID, SPONSOR_ID) VALUES (?, ?)';

        // Execute the query to insert new sponsor
        connection.query(insertSponsorQuery, [USER_ID, sponsorId], (error, insertResults) => {
            if (error) {
                console.error('Error inserting sponsor:', error);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            res.json({ message: 'Sponsor account created successfully', result: insertResults });
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
