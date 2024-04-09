const express = require('express');
const app = express();
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');
const port = process.env.PORT || 3004;
const http = require('http');
const socketIo = require('socket.io');
const crypto = require('crypto');

const server = http.createServer(app);
const io = socketIo(server);

// Cross Origin (DO NOT DELETE)
app.use(cors());

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

app.get('/serverport',(req,res) => {
    res.status(200).json({
        "PORT": port
    });
    return;
})

//get all admin users
app.get('/admins', (req, res) => {
    query = 'SELECT * FROM Admins A JOIN Users U ON A.USER_ID = U.USER_ID'
    connection.query(query,(queryError, result) => {
        if (queryError) {
            console.error('Error executing query:', queryError);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        } else {
            res.status(200).json(result[0]);
            return;
        }
    })
})

app.get('/ebay', (req, res) =>{

    const ITEM_ID = req.query.ITEM_ID;
    const apiUrl = `https://api.ebay.com/buy/browse/v1/item/v1|296084797049|0`;
            // Define your headers
            const headers = {
                'Authorization': 'Bearer v^1.1#i^1#r^0#I^3#p^1#f^0#t^H4sIAAAAAAAAAOVYf2wTVRxf13ZmGUMjMHSKluOHhHnXd+31xx200m6D1bG1rAXZxODr9XU71t6Ve+9YC4pziYtETdCE+QcShkZjAiFR8S+cihIUEob8Y/iDAH8Q0AQSnSgJJOBdO0Y3CSBr4hIvTZr3fd/3fZ/P532/77070FtRubi/qf9qtemh8sFe0FtuMrFVoLLCWjfdXF5rLQNFDqbB3vm9lj7zL0sxTKcyQhvCGUXGyJZNp2Qs5I0+SlNlQYFYwoIM0wgLRBSigZaVgoMBQkZViCIqKcoWavBRThfyuhHwci5R5J2cR7fKt2LGFB/likM2znsBzyEvmxSB3o+xhkIyJlAmPsoBHBwN9B8fY3nBBQSWZ5xuroOyrUEqlhRZd2EA5c/DFfJj1SKsd4cKMUYq0YNQ/lBgeTQcCDU0tsaW2oti+Ud1iBJINDy+Va8kkG0NTGno7tPgvLcQ1UQRYUzZ/YUZxgcVArfAPAD8vNQexEIeuPQHcGySZ0si5XJFTUNydxyGRUrQybyrgGQikdy9FNXViG9AIhltteohQg0242+VBlNSUkKqj2oMBtoDkQjlb4GEdKGeFjqmamJ3IJOhI20NtIf3OHg3J7K0l0+IyMVzoxMVoo3KPGGmekVOSIZo2NaqkCDSUaOJ2nBF2uhOYTmsBpLEQFTk52BvaejiO4xFLayiRrpkY11RWhfClm/eewXGRhOiSnGNoLEIEzvyEvkomMlICWpiZz4XR9Mni31UFyEZwW7v6elhepyMonbaHQCw9rUtK6NiF0pDSvc1ar3gL917AC3lqYhIH4klgeQyOpasnqs6ALmT8nO8E3jZUd3Hw/JPtP7DUMTZPr4iSlUhceBOcBwHPUk3hCwXL0WF+EeT1G7gQHGYo9NQ7UYkk4IiokU9z7Q0UqWE4HQlHU5vEtEJN5+kOT6ZpOOuhJtmkwgBhOJxkff+nwrlflM9ikQVkZLkesny3LkhGWxqXdEUEJuzDWK7nHVubpc3djUu5wN1WnNbXQDLqzztWrY+2Oi732q4I/n6lKQrE9PnL4UARq2XToQmBROUmBS9qKhkUERJSWJuii2wmohAleSiKJXSDZMiqVdhqDR7dcno/ctt4sF4l+6M+o/OpzuywkbKTi1WxnisB4AZiTFOIEZU0naj1hWoXz8M8/o86knxlvSb65RirZMssJUShSsnk6fL4E0ioyKsaKp+22bCxg0spnQjWT/PiKqkUkhdM7kMMOo5ndYIjKfQVCvsEiS4BKfYYct6WIebdzhYflK8xPxRun6qbUml2IotKx7wWm0f/5LvL8s/bJ/pO9Bn+rrcZAJLwQJ2HphbYV5tMU+rxRJBjASTDJY6Zf3dVUVMN8ploKSWzygb+XBHU31tY3hg8ZZY7qedP5RNK/rGMPgSeGzsK0Olma0q+uQAnrzdY2Ufnl3t4AAHeJZ3AZbvAPNu91rYGsvMiyj76WfD319rFt5503rzkbkjx3c1g+oxJ5PJWmbpM5X5Oy7Gd23Z+uLCj6/f2Lf2A6Vdy/1x7JW6JYf/7MjO+6029IbbGn3+OfvlnW9pG6vdF8587njjpvbsiU0jsy9gevfGX8NzDuzfP9RTE3S8cPrk6y0D364bnjVUeWwocYZreLtm+p5DjnXzzcefXhiRwKHV5h+vnb++YOb2iHW15ZsnZpzzjBwNLsvNPxJ+vN/ZeeDsngM36Ku9mUF4aV/2q0+697hmMedfO1UVWfZqdHhgMD4nUcXBw19cuTR391/bruyc8dTAZbBI8nm27h06+mh28/D2kwe3fbRryZzUjlPHTq+t6Pz5An75Xebce22nbpxN7z3xpa+m7uD7R2svW8Tf3baOZxb19B8JBgpr+Te4lk1b/REAAA==',
                'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
                'X-EBAY-C-ENDUSERCTX': 'contextualLocation=country=<2_character_country_code>,zip=<zip_code>,affiliateCampaignId=<ePNCampaignId>,affiliateReferenceId=<referenceId>'
            };
            // Make the GET request with fetch
            fetch(apiUrl, {
                method: 'GET',
                headers: headers
            }).then(response => {
                if (!response.ok) {
                    return res.status(500).json({error: 'Internal server error'});
                }
            })
                .then(data => {
                    console.log(data);
                    return res.status(200).json(data);
                })
                .catch(error => {
                    console.error('There was a problem with your fetch operation:', error);
                    return res.status(500).json({error: 'Internal server error'});
            });
})
// Gets all users or certain user based on username given
app.get('/users', (req, res) => {
    const username = req.query.USERNAME;
    const USER_TYPE = req.query.USER_TYPE;
    const EMAIL = req.query.EMAIL;
    if (!username && !USER_TYPE && !EMAIL){
        query = 'SELECT * FROM Users'
    }
    else if (username){
        query = "SELECT * FROM Users WHERE USERNAME = '" + username.toString() + "'";    
    }
    else if (USER_TYPE){
        query = "SELECT * FROM Users WHERE USER_TYPE = '" + USER_TYPE.toString() + "'"; 
    }
    else if (EMAIL){
        query = "SELECT * FROM Users WHERE EMAIL LIKE '" + EMAIL.toString() + "'"; 
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
        else if(EMAIL)
        {
            res.status(200).json(result[0]);
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
        const query = `SELECT * FROM SponsorCompany where SPONSOR_ID = ${SPONSOR_ID}`;
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
        query = 'SELECT * FROM Sponsors S JOIN Users U on S.USER_ID = U.USER_ID' ;
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
        query = 'SELECT * FROM Sponsors S JOIN Users U on S.USER_ID = U.USER_ID WHERE SPONSOR_ID = ' + SPONSOR_ID.toString();
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
        query = 'SELECT * FROM Sponsors S JOIN Users U on S.USER_ID = U.USER_ID WHERE S.USER_ID = ?';
        connection.query(query, [USER_ID], (queryError, result) => {
          if(queryError) {
            console.error(`Error fetching sponsors associated with ${USER_ID}:`, queryError);
            res.status(500).json({ error: 'Internal server error' });
            return;
          }else{
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
    const SPONSOR_ID = req.query.SPONSOR_ID;
    const USER_ID = req.query.USER_ID;
    // RETURN ALL DRIVERS
    if (!SPONSOR_ID && !USER_ID) {
        query = 'SELECT * FROM DriverSponsorships D JOIN Users U ON D.USER_ID = U.USER_ID';
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
    else if (SPONSOR_ID && USER_ID){
        // RETURNS SPECIFIC DRIVER ASSOCIATED WITH SPECIFIC SPONSOR
        query = 'SELECT * FROM DriverSponsorships D JOIN Users U on D.USER_ID = U.USER_ID WHERE SPONSOR_ID = ' + SPONSOR_ID.toString() 
                + 'AND WHERE USER_ID = ' + USER_ID.toString();
        connection.query(query,(queryError, result)=> {
            if(queryError){
                console.error(`Error fetching drivers associated with ${SPONSOR_ID}:`, queryError);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
            else{
                res.status(200).json(result);
                return;
            }
        });
    }
    else if (SPONSOR_ID) {
        // RETURNS ALL DRIVERs ASSOCIATED WITH SPECIFIC SPONSOR
        query = 'SELECT * FROM DriverSponsorships D JOIN Users U ON D.USER_ID = U.USER_ID WHERE SPONSOR_ID = ' + SPONSOR_ID.toString();
        connection.query(query,(queryError, result)=> {
            if(queryError){
                console.error(`Error fetching drivers associated with ${SPONSOR_ID}:`, queryError);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
            else{
                res.status(200).json(result);
                return;
            }
        });
    }
    else if (USER_ID){
        // RETURNS ALL SPONSORS ASSOCIATED WITH SPECIFIC DRIVER
        query  = `
        SELECT S.SPONSOR_ID, SPONSOR_NAME, POINTS
        FROM DriverSponsorships D
        JOIN SponsorCompany S ON D.SPONSOR_ID = S.SPONSOR_ID
        WHERE USER_ID = ${USER_ID}`
        connection.query(query,(queryError, result)=> {
            if(queryError){
                console.error(`Error fetching sponsors associated with ${USER_ID}:`, queryError);
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
    const SPONSOR_ID = req.query.SPONSOR_ID
    const USER_ID = req.query.USER_ID;
    const STATUS = req.query.STATUS;

    // RETURN ALL APPLICATIONS
    if (!SPONSOR_ID && !USER_ID && !STATUS) {
        query = 'SELECT * FROM Application A JOIN Users U on A.USER_ID = U.USER_ID';
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

    // RETURNS A SPECIFIC APPLICATION BASED ON USER ID AND SPONSOR ID AND STATUS
    else if(SPONSOR_ID && USER_ID && STATUS){
        query = 'SELECT * FROM Application A JOIN Users U on A.USER_ID = U.USER_ID WHERE SPONSOR_ID = ' + SPONSOR_ID.toString() + ' AND USER_ID = ' + USER_ID.toString() +' AND STATUS LIKE ?';
        connection.query(query,[STATUS],(queryError, result)=> {
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

    // RETURNS A SPECIFIC APPLICATION BASED ON USER ID AND SPONSOR ID
    else if(SPONSOR_ID && USER_ID){
        query = 'SELECT * FROM Application A JOIN Users U on A.USER_ID = U.USER_ID WHERE SPONSOR_ID = ' + SPONSOR_ID.toString() + ' AND A.USER_ID = ' + USER_ID.toString();
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

    // RETURNS ALL APPLICATIONs ASSOCIATED WITH SPECIFIC SPONSOR AND STATUS
    else if (SPONSOR_ID && STATUS){
        query = 'SELECT * FROM Application A JOIN Users U on A.USER_ID = U.USER_ID WHERE SPONSOR_ID = ' + SPONSOR_ID.toString() + ' AND STATUS LIKE ?';
        connection.query(query,[STATUS],(queryError, result)=> {
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
    else if (SPONSOR_ID){
        query = 'SELECT * FROM Application A JOIN Users U on A.USER_ID = U.USER_ID WHERE SPONSOR_ID = ' + SPONSOR_ID.toString();
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

     // RETURNS ALL APPLICATIONS FOR SPECIFIC USER WITH A SPECIFIC STATUS
     else if (USER_ID && STATUS)
     {
         query = 'SELECT * FROM Application A JOIN Users U on A.USER_ID = U.USER_ID WHERE A.USER_ID = ' + USER_ID.toString() + ' AND STATUS LIKE ?';
         connection.query(query,[STATUS],(queryError, result)=> {
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
        query = 'SELECT * FROM Application A JOIN Users U on A.USER_ID = U.USER_ID WHERE A.USER_ID = ' + USER_ID.toString();
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
    const challengeCode = req.query.challenge_code;
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
    else if(challengeCode){
        const hash = crypto.createHash('sha256');
        const endpoint = 'https://team27-express.cpsc4911.com/catalog';
        const verificationToken = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
        hash.update(challengeCode);
        hash.update(verificationToken);
        hash.update(endpoint);
        const responseHash = hash.digest('hex');
        console.log(new Buffer.from(responseHash).toString());
        
        const challengeResponse = {
            "challengeResponse": responseHash
        };
        res.status(200).json(challengeResponse);
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

// RETURNS POINT CHANGES
app.get('/point_change',(req, res) => {
    const USER_ID = req.query.USER_ID;
    const SPONSOR_ID = req.query.SPONSOR_ID;
    if(!USER_ID && !SPONSOR_ID)
    {
        const query = `SELECT * FROM AuditEntry A JOIN POINTAUDIT P ON P.AUDIT_ID = A.AUDIT_ID WHERE AUDIT_TYPE LIKE 'POINT CHANGE'`
        connection.query(query,(queryError, result)=> {
            if(queryError){
                console.error(`Error fetching point changes:`, queryError);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
            else{
                res.status(200).json(result);
                return;
            }
        });
    }
    else if(SPONSOR_ID && USER_ID)
    {
        const query = `SELECT * 
        FROM AuditEntry A JOIN POINTAUDIT P ON P.AUDIT_ID = A.AUDIT_ID 
        WHERE AUDIT_TYPE LIKE 'POINT CHANGE'
            AND P.AUDIT_DRIVER = ? AND AUDIT_SPONSOR = ?`
        connection.query(query,[USER_ID,SPONSOR_ID],(queryError, result)=> {
            if(queryError){
                console.error(`Error fetching point changes:`, queryError);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
            else{
                res.status(200).json(result);
                return;
            }
        });
    }
    else if(SPONSOR_ID)
    {
        const query = `SELECT * 
        FROM AuditEntry A JOIN POINTAUDIT P ON P.AUDIT_ID = A.AUDIT_ID 
        WHERE AUDIT_TYPE LIKE 'POINT CHANGE'
            AND AUDIT_SPONSOR = ?`
        connection.query(query,[SPONSOR_ID],(queryError, result)=> {
            if(queryError){
                console.error(`Error fetching point changes:`, queryError);
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
        const query = `SELECT * 
        FROM AuditEntry A JOIN POINTAUDIT P ON P.AUDIT_ID = A.AUDIT_ID 
        WHERE AUDIT_TYPE LIKE 'POINT CHANGE'
            AND P.AUDIT_DRIVER = ?`
        connection.query(query,[USER_ID],(queryError, result)=> {
            if(queryError){
                console.error(`Error fetching point changes:`, queryError);
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
    const { USER_ID, SPONSOR_ID } = req.body;

    // Check if required fields are provided
    if (!USER_ID) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    if (!SPONSOR_ID) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // SQL query to insert data into the Drivers table
    const sql = 'INSERT INTO DriverSponsorships (USER_ID, SPONSOR_ID, POINTS) VALUES (?,?,0)';

    // Execute the query
    connection.query(sql, [USER_ID, SPONSOR_ID], (error, results) => {
        if (error) {
            console.error('Error executing query:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        // Send a success response
        res.json({ message: 'Driver added successfully'});
    });
});

//Adds new admin to database
app.post('/admins',(req,res)=> {
    const {USER_ID} = req.body;

    if(!USER_ID){
        return res.status(400).json({error: 'Missing USER_ID'});
    }
    const adminQuery = `INSERT INTO Admins (USER_ID) VALUES (${USER_ID})`
    connection.query(adminQuery, (error, results) => {
        if(error){
            console.error('Error executing query:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.json({ message: 'Admin added successfully'});
    })
})

// Takes in a new sponsor to Sponsors table
app.post('/sponsors', (req, res) => {
    const { SPONSOR_ADMIN_ID, SPONSOR_COMPANY_ID, USER_ID} = req.body;

    // Check if required fields are provided
    if (!USER_ID || (!SPONSOR_ADMIN_ID && !SPONSOR_COMPANY_ID)) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    let sponsorId = null;
    // If the admins user ID is given, the must get the associated company ID
    if(SPONSOR_ADMIN_ID){
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

            sponsorId = results[0].SPONSOR_ID;
        });
    }
    else{ // We just take the company id and reassign it
        sponsorId = SPONSOR_COMPANY_ID;
    }

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

//Takes in new changes for points audit table
app.post('/point_change',(req,res) =>{
    const {USER_ID, SPONSOR_ID, DRIVER_ID, POINT_TOTAL, REASON} = req.body;
    if(!USER_ID)
    {
        return res.status(400).json({ error: 'MISSING FIELD: USER_ID' });
    }
    if(!SPONSOR_ID)
    {
        return res.status(400).json({ error: 'MISSING FIELD: SPONSOR_ID' });
    }
    if(!REASON)
    {
        return res.status(400).json({ error: 'MISSING FIELD: REASON' });
    }
    if(!POINT_TOTAL)
    {
        return res.status(400).json({ error: 'MISSING FIELD: POINT_TOTAL' });
    }
    if(!DRIVER_ID)
    {
        return res.status(400).json({ error: 'MISSING FIELD: DRIVER_ID' });
    }

    // Create initial insert into AuditEntry table
    auditSql = 'INSERT INTO AuditEntry (USER_ID, AUDIT_TYPE, AUDIT_DATE) VALUES (?, "Point Change", CURRENT_TIMESTAMP())'
    connection.query(auditSql, [USER_ID], (error, results) => {
        if (error) {
            console.error('Error inserting item into AuditEntry table :', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        } else {
            console.log('AuditEntry item added successfully:', results);
        }
    // Insert into log in table
        loginSql = 'INSERT INTO POINTAUDIT (AUDIT_ID, AUDIT_SPONSOR, AUDIT_DRIVER, AUDIT_POINTS, AUDIT_REASON) VALUES (?,?,?,?,?)'
        const AUDIT_ID = results.insertId;

        connection.query(loginSql, [AUDIT_ID, SPONSOR_ID, DRIVER_ID, POINT_TOTAL, REASON], (error, results) => {
            if (error) {
                console.error('Error inserting item into point audit table :', error);
                return res.status(500).json({ error: 'Internal Server Error' });
            } else {
                console.log('Driver points added successfully:', results);
                return res.status(200).json({ message: 'Driver points audited successfully' });
            }
        });
    });
})

// Takes in application change for Audit Table
app.post('/application_change',(req,res) =>{
    const {USER_ID, SPONSOR_ID, DRIVER_ID, STATUS, REASON} = req.body;
    if(!USER_ID)
    {
        return res.status(400).json({ error: 'MISSING FIELD: USER_ID' });
    }
    if(!SPONSOR_ID)
    {
        return res.status(400).json({ error: 'MISSING FIELD: SPONSOR_ID' });
    }
    if(!REASON)
    {
        return res.status(400).json({ error: 'MISSING FIELD: REASON' });
    }
    if(!STATUS)
    {
        return res.status(400).json({ error: 'MISSING FIELD: STATUS' });
    }
    if(!DRIVER_ID)
    {
        return res.status(400).json({ error: 'MISSING FIELD: DRIVER_ID' });
    }

    // Create initial insert into AuditEntry table
    auditSql = 'INSERT INTO AuditEntry (USER_ID, AUDIT_TYPE, AUDIT_DATE) VALUES (?, "Driver Application", CURRENT_TIMESTAMP())'
    connection.query(auditSql, [USER_ID], (error, results) => {
        if (error) {
            console.error('Error inserting item into AuditEntry table :', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        } else {
            console.log('AuditEntry item added successfully:', results);
        }
    // Insert into application audit table
        loginSql = 'INSERT INTO APPAUDIT (AUDIT_ID, AUDIT_SPONSOR, AUDIT_DRIVER, AUDIT_STATUS, AUDIT_REASON) VALUES (?,?,?,?,?)'
        const AUDIT_ID = results.insertId;

        connection.query(loginSql, [AUDIT_ID, SPONSOR_ID, DRIVER_ID, STATUS, REASON], (error, results) => {
            if (error) {
                console.error('Error inserting item into application audit table :', error);
                return res.status(500).json({ error: 'Internal Server Error' });
            } else {
                console.log('Driver application added successfully:', results);
                return res.status(200).json({ message: 'Driver Application audited successfully' });
            }
        });
    });
})

// Takes in a new password change for the audit table
app.post('/password_change',(req, res)=>{
    const {USER_ID, AUDIT_USER_ID, REASON} = req.body;
    if(!USER_ID)
    {
        return res.status(400).json({ error: 'MISSING FIELD: USER_ID' });
    }
    if(!AUDIT_USER_ID)
    {
        return res.status(400).json({ error: 'MISSING FIELD: AUDIT_USER_ID' });
    }
    if(!REASON)
    {
        return res.status(400).json({ error: 'MISSING FIELD: REASON' });
    }
    // Create initial insert into AuditEntry table
    auditSql = 'INSERT INTO AuditEntry (USER_ID, AUDIT_TYPE, AUDIT_DATE) VALUES (?, "Password Change", CURRENT_TIMESTAMP())'
    connection.query(auditSql, [USER_ID], (error, results) => {
        if (error) {
            console.error('Error inserting item into AuditEntry table :', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        } else {
            console.log('AuditEntry item added successfully:', results);
        }
    // Insert into password audit table
        loginSql = 'INSERT INTO PASSAUDIT (AUDIT_ID, AUDIT_USER, AUDIT_CHANGE_TYPE) VALUES (?,?,?)'
        const AUDIT_ID = results.insertId;

        connection.query(loginSql, [AUDIT_ID, AUDIT_USER_ID, REASON], (error, results) => {
            if (error) {
                console.error('Error inserting item into password change tables :', error);
                return res.status(500).json({ error: 'Internal Server Error' });
            } else {
                console.log('Password change attempt added successfully:', results);
                return res.status(200).json({ message: 'Password change added successfully' });
            }
        });
    });

});

// Takes in a new log in attempt for the audit table
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
    auditSql = 'INSERT INTO AuditEntry (USER_ID, AUDIT_TYPE, AUDIT_DATE) VALUES (NULL, "Log in attempt", CURRENT_TIMESTAMP())'
    connection.query(auditSql, (error, results) => {
        if (error) {
            console.error('Error inserting item into AuditEntry table :', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        } else {
            console.log('AuditEntry item added successfully:', results);
        }
    // Insert into log in table
        loginSql = 'INSERT INTO LOGINAUDIT (AUDIT_ID, AUDIT_USERNAME, AUDIT_STATUS) VALUES (?,?,?)'
        const AUDIT_ID = results.insertId;

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

});

app.patch('/sponsors/:SPONSOR_ID',(req,res) => {
    const SPONSOR_ID = req.params.SPONSOR_ID;
    const {SPONSOR_NAME, POINT_MULTIPLIER} = req.body;
    if(!SPONSOR_ID)
    {
        console.log("No SPONSOR_ID in query provided");
        return res.status(400).json({error: "No SPONSOR_ID provided in query"});
    }
    if(SPONSOR_NAME)
    {
        sql = `UPDATE SponsorCompany SET SPONSOR_NAME = ${SPONSOR_NAME} WHERE SPONSOR_ID = ${SPONSOR_ID}`
        connection.query(sql, (error, results) => {
            if (error) {
                console.error('Error updating sponsor name', error);
                return res.status(500).json({ error: 'Internal Server Error' });
            } else {
                console.log('Sponsor name updated successfully:', results);
                return res.status(200).json({ message: "Sponsor name updated" });
            }
        });
    }
    else if(POINT_MULTIPLIER)
    {
        sql = `UPDATE SponsorCompany SET POINT_MULTIPLIER = ${POINT_MULTIPLIER} WHERE SPONSOR_ID = ${SPONSOR_ID}`
        connection.query(sql, (error, results) => {
            if (error) {
                console.error('Error updating point multiplier', error);
                return res.status(500).json({ error: 'Internal Server Error' });
            } else {
                console.log('Point Multiplier updated successfully:', results);
                return res.status(200).json({ message: "Point Multiplier updated" });
            }
        });
    }
    else
    {setClause
        console.error('Error, no fields to update for sponsor', error);
        return res.status(400).json({ error: 'Missing Fields' });
    }
});

// Updates a users information and assigns them to the sponsors table
app.patch('/users/:USER_ID',(req,res) =>{
    const USER_ID = req.params.USER_ID;
    const {FNAME, LNAME} = req.body;
    if(USER_ID === undefined)
    {
        console.log('No USER_ID provided in query')
        return res.status(400).json({ error: 'No USER_ID provided in query' });
    }

    if(!FNAME && !LNAME)
    {
        console.log('No fields to update')
        return res.status(400).json({ error: 'No fields to update' });
    }

    if(FNAME){
        const fname_sql = `UPDATE Users SET FNAME = ? WHERE USER_ID = ?`;
        connection.query(fname_sql,[FNAME,USER_ID], (error, results) => {
        if (error) {
            console.error('Error updating user:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        } else {
            console.log('User updated successfully:', results);
        }
    });
    }

    if(LNAME){
        const lname_sql = `UPDATE Users SET LNAME = ? WHERE USER_ID = ?`;
        connection.query(lname_sql, [LNAME, USER_ID], (error, results) => {
        if (error) {
            console.error('Error updating user:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        } else {
            console.log('User updated successfully:', results);
        }
    });
    }
    return res.status(200).json({ message: 'User and Sponsor updated successfully' });
});

// Updates a drivers point value with a specific company
app.patch('/drivers/:USER_ID/:SPONSOR_ID', (req, res) => {
    const USER_ID = req.params.USER_ID;
    const SPONSOR_ID = req.params.SPONSOR_ID;
    const { POINTS } = req.body;
    
    // Check if at least one field is provided for update
    if (POINTS === undefined) {
        return res.status(400).json({ error: 'Missing Field: POINTS' });
    }
    
    // SQL query to update driver's information
    const sql = `UPDATE DriverSponsorships SET POINTS = ${POINTS} WHERE USER_ID = ${USER_ID} AND SPONSOR_ID = ${SPONSOR_ID}`;
    
    // Execute the query
    connection.query(sql, (error, results) => {
        if (error) {
            console.error('Error updating driver:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Driver not found' });
        }
        // Send a success response
        return res.json({ message: 'Driver point information updated successfully'});
    });
});

// Updates Application Status
app.patch('/applications/:USER_ID/:SPONSOR_ID', (req,res) => {
    const USER_ID = req.params.USER_ID;
    const SPONSOR_ID = req.params.SPONSOR_ID;
    const {STATUS, REASON} = req.body;
    if (STATUS === undefined) {
        return res.status(400).json({ error: 'Missing Field: STATUS' });
    }
    if (REASON === undefined) {
        return res.status(400).json({ error: 'Missing Field: REASON' });
    }
    const sql = 'UPDATE Application SET STATUS = ?, REASON = ? WHERE USER_ID = ? AND SPONSOR_ID = ?';
    const values = [STATUS, REASON, USER_ID, SPONSOR_ID];    
    connection.query(sql, values, (error, results) => {
        if (error) {
            console.error('Error updating driver:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Application not found' });
        }
        
        // Send a success response
        return res.json({ message: 'Application updated successfully'});
    });
})

app.delete('/catalog/:CATALOG_ID',(req,res) => {
    const CATALOG_ID = req.params.CATALOG_ID;
    if(CATALOG_ID === undefined){
        return res.status(400).json({error: 'Missing Catalog ID'});
    }
    const sql = `DELETE FROM CATALOG WHERE CATALOG_ID = ?`;
    connection.query(sql, CATALOG_ID, (error,results) => {
        if(error){
            console.error('Error removing catalog item');
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        return res.status(200).json({ message: 'Item removed successfully' })
    });
})

// Remove Driver from DriverSponsorships Table
app.delete('/drivers/:USER_ID/:SPONSOR_ID', (req, res) => {
    const USER_ID = req.params.USER_ID;
    const SPONSOR_ID = req.params.SPONSOR_ID;

    const sql = 'DELETE FROM DriverSponsorships WHERE USER_ID = ? AND SPONSOR_ID = ?';
    const values = [USER_ID, SPONSOR_ID];

    connection.query(sql, values, (error, results) => {
        if (error) {
            console.error('Error removing driver:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Driver not found' });
        }
        
        return res.json({ message: 'Driver removed successfully' });
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
