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
app.get('/', (req, res) => {
  // Fetch data from MariaDB
  connection.query('SELECT * FROM candidates', (err, rows) => {
    if (err) {
      console.error('Error executing query: ', err);
      res.status(500).send('Error fetching data from database');
      return;
    }

    // Extract necessary data from rows
    const labels = rows.map(row => row.name);
    const counts = rows.map(row => row.vote_count);

    // Generate an array of colors for each candidate
    const colors = ['blue', 'green', 'red'];

    // Calculate the total number of votes
    const totalVotes = counts.reduce((a, b) => a + b, 0);

    // Render the chart in the response
    res.send(`
      <html>
        <head>
          <title>Result Chart</title>
          <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        </head>
        <body>
        <h1>Result Board</h1>
        <p>Total Votes Cast: ${totalVotes}</p>

          <canvas id="chart"></canvas>
          <script>
            const ctx = document.getElementById('chart').getContext('2d');
            new Chart(ctx, {
              type: 'bar',
              data: {
                labels: ${JSON.stringify(labels)},
                datasets: [{
                  label: 'Vote Counts',
                  data: ${JSON.stringify(counts)},
                  backgroundColor: ${JSON.stringify(colors)},
                  borderColor: 'rgba(0, 0, 0, 1)',
                  borderWidth: 1
                }]
              },
              options: {
                responsive: true,
                scales: {
                  y: {
                    beginAtZero: true,
                    precision: 0
                  }
                },
                plugins: {
                  afterDraw: function(chart) {
                    const ctx = chart.ctx;
                    ctx.font = '16px Arial';
                    ctx.fillStyle = 'black';
                    ctx.textAlign = 'start';
                    ctx.fillText('Total Votes: ${totalVotes}', 10, 20);
                  }
                }
              }
            });
          </script>
        </body>
      </html>
    `);
  });
});

// Start the server
app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
