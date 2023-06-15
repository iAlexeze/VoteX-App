const express = require('express');
const mysql = require('mysql');
const app = express();

// Create a connection to the MariaDB database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'admin',
  password: 'admin',
  database: 'votingapp'
});

// Connect to the MariaDB database
connection.connect(err => {
  if (err) {
    console.error('Error connecting to MariaDB database: ', err);
    return;
  }
  console.log('Connected to MariaDB database');
});

// Define a route to fetch data from MariaDB and render it
app.get('/', async (req, res) => {
  try {
    // Fetch data from MariaDB (candidates table)
    const candidateRows = await new Promise((resolve, reject) => {
      connection.query('SELECT * FROM candidates', (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });

    // Fetch data from MariaDB (votingapp.users table)
    const userRows = await new Promise((resolve, reject) => {
      connection.query('SELECT * FROM votingapp.users', (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });

    // Fetch data from MariaDB (votingapp.users table)
    const countRows = await new Promise((resolve, reject) => {
      connection.query('SELECT COUNT(*) as total_votes FROM votingapp.users', (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });

    // Extract necessary data from query results
    const candidateLabels = candidateRows.map(row => row.name);
    const candidateCounts = candidateRows.map(row => row.vote_count);
    const totalVotes = countRows[0].total_votes;

    // Extract necessary data from query results
    const userIds = userRows.map(row => row.id);
    const userNames = userRows.map(row => row.name);
    const userEmails = userRows.map(row => row.email);


    res.send(`
      <html>
        <head>
          <title>Admin Dashboard</title>
          <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
          <style>
            body {
              display: flex;
              align-items: center;
              justify-content: center;
              flex-direction: column;
            }
            .container {
              display: flex;
              justify-content: center;
              align-items: flex-start;
            }
            .chart-container {
              width: 300px;
              height: 300px;
              margin-right: 20px;
            }
            table {
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid black;
              padding: 8px;
            }
            th {
              background-color: lightgray;
            }
            .download-button {
              margin-top: 20px;
              background-color: green;
              color: white;
              border-radius: 10px;
              cursor: pointer;
            }
      .download-button:hover {
      background-color: rgb(88, 247, 71);
    }

          </style>
        </head>
        <body>
          <h1>Admin Dashboard</h1>
          <p>Total Votes Cast: ${totalVotes}</p>
          <div class="container">
            <div class="chart-container">
              <h2>Chart</h2>
              <canvas id="chart"></canvas>
            </div>
            <div>
              <h2>Voters Details</h2>
              <table>
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Name</th>
                    <th>Email</th>
                  </tr>
                </thead>
                <tbody>
                  ${userRows
                    .map(row => `<tr><td>${row.id}</td><td>${row.name}</td><td>${row.email}</td></tr>`)
                    .join('')}
                </tbody>
              </table>
              <button class="download-button" onclick="downloadPDF()">Download as PDF</button>
            </div>
          </div>
          <script>
            const ctx = document.getElementById('chart').getContext('2d');
            new Chart(ctx, {
              type: 'pie',
              data: {
                labels: ${JSON.stringify(candidateLabels)},
                datasets: [{
                  label: 'Vote Counts',
                  data: ${JSON.stringify(candidateCounts)},
                  backgroundColor: [
                    'blue',
                    'green',
                    'red'
                  ],
                  borderWidth: 1
                }]
              },
              options: {
                responsive: false
              }
            });

            // function downloadPDF() {
            //   const downloadButton = document.querySelector('.download-button');
            //   downloadButton.disabled = true;
            //   downloadButton.textContent = '';

            //   const options = {
            //     format: 'A4',
            //     printBackground: true
            //   };

            //   setTimeout(() => {
            //     window.print();
            //     downloadButton.disabled = false;
            //     downloadButton.textContent = 'Download as PDF';
            //   }, 1000);
            // }
            
          </script>
        </body>
      </html>
    `);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Start the server
app.listen(2000, () => {
  console.log('Server listening on port 2000');
});
