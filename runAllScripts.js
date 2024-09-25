const { exec } = require('child_process');
const readline = require('readline');

// Create an interface for reading user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Ask the user for both location and product name
rl.question('Enter the location: ', (location) => {
  rl.question('Enter the product name: ', (productName) => {
    
    // Function to execute a script with location and product name as arguments
    const runScript = (scriptName) => {
      return new Promise((resolve, reject) => {
        console.log(`Executing ${scriptName} with location: ${location} and product: ${productName}`);
        exec(`node ${scriptName} "${location}" "${productName}"`, (error, stdout, stderr) => {
          if (error) {
            console.error(`Error executing ${scriptName}:`, error);
            reject(error);
            return;
          }
          if (stdout) {
            console.log(`Output from ${scriptName}:\n${stdout}`);
          }
          if (stderr) {
            console.error(`stderr from ${scriptName}:\n${stderr}`);
          }
          resolve(stdout);
        });
      });
    };

    // Run all scripts concurrently
    (async () => {
      try {
        const results = await Promise.all([
          runScript('swiggydata.js'),   // Pass user-defined product
          runScript('blinkitdata.js'),  // Pass user-defined product
          runScript('zeptodata.js')     // Pass user-defined product
        ]);

        console.log('All scripts have completed.');
        // Optionally log results here if needed
        results.forEach((result, index) => {
          console.log(`Result from script ${index + 1}:\n${result}`);
        });
      } catch (error) {
        console.error('One or more scripts failed:', error);
      } finally {
        rl.close();
      }
    })();
  });
});
