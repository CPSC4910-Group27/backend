const express = require('express');
const app = express();
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');
const port = process.env.PORT || 3004;

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
app.use(cors());

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

// Gets all users or certain user based on username given
app.get('/users', (req, res) => {
    const username = req.query.USERNAME;
    const USER_TYPE = req.query.USER_TYPE;
    if (!username && !USER_TYPE) {
        query = 'SELECT * FROM Users'
    }
    else if (username)
    {
        query = "SELECT * FROM Users WHERE USERNAME = '" + username.toString() + "'";    
    }
    else if (USER_TYPE)
    {
        query = "SELECT * FROM Users WHERE USER_TYPE = '" + USER_TYPE.toString() + "'"; 
    }
    else{
            res.status(400).json({ error: 'Missing Query Params' });
            return;
        }
    connection.query(query,(queryError, result) => {
        if (queryError) {
            console.error('Error executing query:', queryError);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        } 
        else if(!username && !USER_TYPE)
        {
            res.status(200).json(result);
        }
         
        else if(username){
            // Result will contain the most recent entry
            res.status(200).json(result[0]);
            return;
        }
        else if(USER_TYPE)
        {
            res.status(200).json(result);
        }
    });
});

// Returns all sponsors or a list of sponsors associated with user ID
app.get('/sponsors', (req, res) => {
    const SPONSOR_ID = req.query.SPONSOR_ID;
    if(!SPONSOR_ID){
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
    }
    else if (SPONSOR_ID)
    {
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
    }
});

// GETS ALL SPONSOR ACCOUNTS
// CAN ALSO RETURN ALL SPONSORS ASSOCIATED WITH SPECIFIC SPONSOR COMPANY BY USING QUERY PARAM
// WILL ALSO RETURN SPECIFIC SPONSOR ACCOUNT BASED ON USER ID
// ALSO RETURNS ADMIN STATUS
app.get('/sponsoraccounts', async (req, res) => {
    const SPONSOR_ID = req.query.SPONSOR_ID;
    const USER_ID = req.query.USER_ID;
    // RETURN ALL SPONSOR ACCOUNTS
    if (!SPONSOR_ID && !USER_ID) {
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
    else if(SPONSOR_ID){
        // RETURNS ALL SPONSORS ASSOCIATED WITH SPECIFIC SPONSOR
        query = 'SELECT * FROM Sponsors WHERE SPONSOR_ID = ' + SPONSOR_ID.toString();
        connection.query(query,(queryError, result)=> {
            if(queryError){
                console.error('Error fetching sponsors associated with ${USER_ID}:', queryError);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
            else{
                res.status(200).json(result);
                return;
            }
        });
    }
    else if(USER_ID)
    {
        // RETURNS SPONSOR ASSOCIATED WITH SPECIFIC USER ID
        query = 'SELECT * FROM Sponsors WHERE USER_ID = ?';
        connection.query(query, [USER_ID], (queryError, result) => {
          if (queryError) {
            console.error(`Error fetching sponsors associated with ${USER_ID}:`, queryError);
            res.status(500).json({ error: 'Internal server error' });
            return;
          } else {
            // Assuming you expect only one sponsor, use result[0]
            res.status(200).json(result[0]);
            return;
          }
        });
    }
});
  
/* 
    WHERE TO GET ALL INFORMATION ASSOCIATED WITH A DRIVER SPONSORSHIPS
    BY DEFAULT WILL RETURN ALL DRIVERS ASSOCIATED WITH SPONSORS
    WITH A QUERY OF sponsorID WILL RETURN ALL DRIVERS ASSOCIATED WITH SPONSOR
    WITH A QUERY OF userID WILL RETURN ALL SPONSORS ASSOCIATED WITH userID
    WITH A QUERY OF BOTH WILL RETURN SPECIFIC SPONSOR
*/
app.get('/drivers', async (req, res) => {
    const sponsorID = req.query.sponsorID;
    const userID = req.query.userID;
    // RETURN ALL DRIVERS
    if (!sponsorID && !userID) {
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
    else if (sponsorID && userID){
        // RETURNS SPECIFIC DRIVER ASSOCIATED WITH SPECIFIC SPONSOR
        query = 'SELECT * FROM DriverSponsorships WHERE SPONSOR_ID = ' + sponsorID.toString() 
                + 'AND WHERE USER_ID = ' + userID.toString();
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
    else if (sponsorID) {
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
    else if (userID){
        // RETURNS ALL SPONSORS ASSOCIATED WITH SPECIFIC DRIVER
        query  = `
        SELECT S.SPONSOR_ID, SPONSOR_NAME, POINTS
        FROM DriverSponsorships D
        JOIN SponsorCompany S ON D.SPONSOR_ID = S.SPONSOR_ID
        WHERE USER_ID = ${userID}`
        connection.query(query,(queryError, result)=> {
            if(queryError){
                console.error(`Error fetching sponsors associated with ${userID}:`, queryError);
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
    const sponsorID = req.query.sponsorID
    const USER_ID = req.query.USER_ID;
    // RETURN ALL APPLICATIONS
    if (!sponsorID && !USER_ID) {
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
    // RETURNS A SPECIFIC APPLICATION BASED ON USER ID AND SPONSOR ID
    else if(sponsorID && USER_ID){
        query = 'SELECT * FROM Application WHERE SPONSOR_ID = ' + sponsorID.toString() + ' AND USER_ID = ' + USER_ID.toString();
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
    // RETURNS ALL APPLICATIONs ASSOCIATED WITH SPECIFIC SPONSOR
    else if (sponsorID){
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
    // RETURNS ALL APPLICATIONS FOR SPECIFIC USER
    else if (USER_ID)
    {
        query = 'SELECT * FROM Application WHERE USER_ID = ' + USER_ID.toString();
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

// RETURNS ALL ITEMS FROM THE CATALOG 
// OR WILL RETURN ALL ITEMS ASSOCIATED WITH A SPECIFIC SPONSOR
app.get('/catalog',(req,res)=>{
    const SPONSOR_ID = req.query.SPONSOR_ID;
    // RETURNS ALL CATALOG ITEMS ASSOCIATED WITH A SPECIFIC SPONSOR
    if(SPONSOR_ID){
        sql = `SELECT * FROM CATALOG WHERE SPONSOR_ID = ${SPONSOR_ID}`
        connection.query(sql,(queryError, result)=> {
            if(queryError){
                console.error(`Error fetching catalog items associated with ${SPONSOR_ID}:`, queryError);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
            else{
                res.status(200).json(result);
                return;
            }
        });
    }
    // ELSE RETURN ALL CATALOG ITEMS
    else{
        sql = `SELECT * FROM CATALOG`
        connection.query(sql,(queryError, result)=> {
            if(queryError){
                console.error(`Error fetching catalog items associated with ${SPONSOR_ID}:`, queryError);
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
    const {USER_TYPE, EMAIL, USERNAME, FNAME, LNAME} = req.body;

    // Check if required fields are provided
    if (!USER_TYPE || !EMAIL || !USERNAME || !FNAME || !LNAME) {
        const missingFields = [];
        if (!USER_TYPE) {
            missingFields.push('USER_TYPE');
        }
        if (!EMAIL) {
            missingFields.push('EMAIL');
        }
        if (!USERNAME) {
            missingFields.push('USERNAME');
        }
        if (!FNAME) {
            missingFields.push('FNAME');
        }
        if (!LNAME) {
            missingFields.push('LNAME');
        }
        const errorMessage = `ERROR INSERTING USER! Missing fields: ${missingFields.join(', ')}`;
        console.log(errorMessage);
        return res.status(400).json({ error: errorMessage });
    }
    
    // SQL query to insert data into the Users table
    const userSQL = 'INSERT INTO Users (USER_TYPE, EMAIL, USERNAME, FNAME, LNAME) VALUES (?, ?, ?, ?, ?)';
    
    // Execute the query
    connection.query(userSQL, [USER_TYPE, EMAIL, USERNAME, FNAME, LNAME], (error, results) => {
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

// Updates a users information and assigns them to the sponsors table
app.patch('/users/:USER_ID',(req,res) =>{
    const USER_ID = req.params.USER_ID;
    const {SPONSOR_ID, USER_TYPE} = req.body;
    console.log("USER_ID",USER_ID);
    console.log("SPONSOR ID ", SPONSOR_ID," USER TYPE ", USER_TYPE);
    if(USER_ID === undefined)
    {
        console.log('No USER_ID provided in query')
        return res.status(400).json({ error: 'No USER_ID provided in query' });
    }
    if(!USER_TYPE)
    {
        console.log('No USER_TYPE to change too')
        return res.status(400).json({ error: 'No USER_TYPE to change too' });
    }
    if(!SPONSOR_ID)
    {
        console.log('No SPONSOR_ID to assign')
        return res.status(400).json({ error: 'No SPONSOR_ID to assign' });
    }
    const users_sql = `UPDATE Users SET USER_TYPE = ? WHERE USER_ID = ?`;
    connection.query(users_sql,[USER_TYPE,USER_ID], (error, results) => {
        if (error) {
            console.error('Error updating user:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        } else {
            console.log('User updated successfully:', results);
        }
    });
    const insertSponsorSQL = 'INSERT INTO Sponsors (USER_ID, SPONSOR_ID) VALUES (?, ?)';
    connection.query(insertSponsorSQL, [USER_ID, SPONSOR_ID], (error, results) => {
        if (error) {
            console.error('Error updating user:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        } else {
            console.log('User updated successfully:', results);
            return res.status(200).json({ message: 'User and Sponsor updated successfully' });
        }
    });
});

// Update a driver's information
app.patch('/drivers/:USER_ID', (req, res) => {
    const USER_ID = req.params.USER_ID;
    const { SPONSOR_ID, POINTS } = req.body;
    
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

// Takes in a new item to the catalog
app.post('/catalog',(req, res) =>{
    const {ITEM_ID, SPONSOR_ID} = req.body;
    if(!SPONSOR_ID)
    {
        return res.status(400).json({ error: 'MISSING FIELD: SPONSOR_ID' });
    }
    if(!ITEM_ID)
    {
        return res.status(400).json({ error: 'MISSING FIELD: ITEM_ID' });
    }
    sql = `INSERT INTO CATALOG (ITEM_ID, SPONSOR_ID) VALUES (?, ?)`
    connection.query(sql, [ITEM_ID, SPONSOR_ID], (error, results) => {
        if (error) {
            console.error('Error inserting item into catalog :', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        } else {
            console.log('Catalog item added successfully:', results);
            return res.status(200).json({ message: 'Item added successfully' });
        }
    });
});

// Takes in a new log in attempt
app.post('/login_attempt',(req, res)=>{
    const {USERNAME, SUCCESS} = req.body;
    if(!USERNAME)
    {
        return res.status(400).json({ error: 'MISSING FIELD: USERNAME' });
    }
    if(SUCCESS === null)
    {
        return res.status(400).json({ error: 'MISSING FIELD: SUCCESS' });
    }
    // Create initial insert into AuditEntry table
    auditSql = 'INSERT INTO AuditEntry (USER_ID, AUDIT_TYPE, AUDIT_DATE) VALUES (NULL, "Log in attempt", CURDATE())'
    connection.query(auditSql, (error, results) => {
        if (error) {
            console.error('Error inserting item into AuditEntry table :', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        } else {
            console.log('AuditEntry item added successfully:', results);
        }
    });
    // Insert into log in table
    const AUDIT_ID = results.insertId;
    loginSql = 'INSERT INTO LOGINAUDIT (AUDIT_ID, AUDIT_USERNAME, AUDIT_STATUS VALUES (?,?,?)'
    connection.query(loginSql, [AUDIT_ID, USERNAME, SUCCESS], (error, results) => {
        if (error) {
            console.error('Error inserting item into log in tables :', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        } else {
            console.log('Log in attepmt added successfully:', results);
            return res.status(200).json({ message: 'Log in attempt added successfully' });
        }
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
