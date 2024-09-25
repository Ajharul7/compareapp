const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API to trigger the runAllScript.js
app.post('/run-scripts', (req, res) => {
  const { location, product } = req.body; // Get location and product from request body

  console.log(`Received location: ${location}, product: ${product}`);

  const runScript = (scriptName, locationArg, productArg) => {
    return new Promise((resolve, reject) => {
      exec(`node ${scriptName} "${locationArg}" "${productArg}"`, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error executing ${scriptName}:`, error);
          reject(error);
          return;
        }
        resolve(stdout);
      });
    });
  };

  // Run the scripts with dynamic product and location
  (async () => {
    try {
      const results = await Promise.all([
        runScript('swiggydata.js', location, product), // product from frontend input
        runScript('blinkitdata.js', location, product), // product from frontend input
        runScript('zeptodata.js', location, product)    // product from frontend input
      ]);

      // Send results as JSON
      res.json({ success: true, results });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  })();
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
