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

// HOME PAGE 
app.get('/', (req, res) => {
  res.send('Hello, Express!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
