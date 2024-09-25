const puppeteer = require('puppeteer');
// Retrieve the location from command line arguments
const location = process.argv[2] || 'Default Location';

(async () => {
  const browser = await puppeteer.launch({
    headless: false,  // Run in visible mode
    args: [
      '--start-maximized',    // Open browser maximized
      '--disable-web-security',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-features=IsolateOrigins,site-per-process', // To bypass some restrictions
    ],
  });

  const page = await browser.newPage();

  // Log any browser console messages
  // page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  // Optionally set media type for correct display
  await page.emulateMediaType('screen');

  // Set user agent
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

  // Go to Zepto website
  await page.goto('https://www.zeptonow.com/', { waitUntil: 'networkidle2' });

  // Wait for the button to be visible
  await page.waitForSelector('button.px-7.text-base.border-skin-primary');

  // Click the "Type manually" button
  await page.click('button.px-7.text-base.border-skin-primary');

  // console.log('Clicked the "Type manually" button!');

  // Wait for the input field to appear
  await page.waitForSelector('input[placeholder="Search a new address"]');

  // Type "Bengaluru" into the input field
  await page.type('input[placeholder="Search a new address"]', location);

  // console.log('Entered "Bengaluru" into the input field!');

  // Wait for the location list to appear
  await page.waitForSelector('div.flex.cursor-pointer.items-center.pt-4.text-left');

  // Click the first location in the list
  await page.click('div.flex.cursor-pointer.items-center.pt-4.text-left');

  // console.log('Clicked the first location from the dropdown!');

  // Wait for the "Confirm & Continue" button to appear
  await page.waitForSelector('button[aria-label="Confirm Action"]');

  // Wait for 2 seconds before clicking the button
  await new Promise(resolve => setTimeout(resolve, 4000));  // Wait for 2 seconds

  // Click the "Confirm & Continue" button
  await page.click('button[aria-label="Confirm Action"]');

  // console.log('Clicked the "Confirm & Continue" button after waiting for 2 seconds!');

  // Wait for the search icon to be visible
  await page.waitForSelector('a[aria-label="Search for products"]');

  // Click the search icon
  await page.click('a[aria-label="Search for products"]');

  // console.log('Clicked the search icon!');

  // Wait for the search input to appear
  await page.waitForSelector('input[placeholder="Search for over 5000 products"]');
  const product = process.argv[3];
  // Type "saffola oil" into the search input
  await page.type('input[placeholder="Search for over 5000 products"]', product);

  // console.log('Entered "saffola oil" into the search input!');

  // Press Enter to submit the search
  await page.keyboard.press('Enter');

  // console.log('Pressed Enter to submit the search!');

  // Wait for the product card elements to be loaded
  await page.waitForSelector('a[href^="/pn/"]', { timeout: 30000 });

  // Extract product data
  const productData = await page.evaluate(() => {
    const products = [];

    const productCards = document.querySelectorAll('a[href^="/pn/"]');

    productCards.forEach(product => {
      const name = product.querySelector('h5')?.innerText || null;
      const size = product.querySelector('h4.font-heading')?.innerText || null;
      const price = product.querySelector('div.flex.gap-1 h4.font-heading')?.innerText || null; // Updated price selector
      const oldPrice = product.querySelector('p.line-through')?.innerText || null;
      const discount = product.querySelector('p.absolute.top-0')?.innerText || null;
      const imageUrl = product.querySelector('img')?.src || null;
      const productUrl = product.getAttribute('href') || null;

      products.push({
        name,
        size,
        price,
        oldPrice,
        discount,
        imageUrl,
        productUrl,
      });
    });

    return products;
  });

  console.log('Data from Zepto:', productData);

  await browser.close();
})();
