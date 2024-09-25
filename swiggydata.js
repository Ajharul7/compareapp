const puppeteer = require('puppeteer');

// Retrieve the location from command line arguments

(async () => {
  const browser = await puppeteer.launch({
    headless: false, // Set to true when debugging is not needed
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    ignoreHTTPSErrors: true,
    defaultViewport: null,
  });

  const page = await browser.newPage();

  // Set a realistic user agent
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  );

  // Enable JavaScript
  await page.setJavaScriptEnabled(true);
  // Deny geolocation access (equivalent to pressing "Do not allow")
  const context = browser.defaultBrowserContext();
  await context.overridePermissions('https://www.swiggy.com', ['geolocation']);

  // Navigate to Swiggy Instamart
  await page.goto('https://www.swiggy.com/instamart', { waitUntil: 'networkidle2' });

   // Wait for the location element and click it
   await page.waitForSelector('div[data-testid="address-name"]', { visible: true, timeout: 60000 });
   await page.click('div[data-testid="address-name"]');

    // Wait for the "Enter Location Manually" element to appear
  await page.waitForSelector('div.ohuuP._33_H_', { visible: true, timeout: 60000 });

  // Scroll the element into view and click
  await page.evaluate(() => {
    const element = document.querySelector('div.ohuuP._33_H_');
    element.scrollIntoView();
  });

  // Small delay before clicking to ensure stability
  await new Promise(r => setTimeout(r, 500));


  // Attempt to click
  try {
    await page.click('div.ohuuP._33_H_');
    // console.log('Successfully clicked the location input.');
  } catch (error) {
    console.error('Error clicking the element:', error);
  }

  // Wait for the input field to appear
  await page.waitForSelector('input._1wkJd[placeholder="Search for area, street name…"]', { visible: true, timeout: 60000 });

  // Type 'Kolkata' into the input field
  const location = process.argv[2];
  await page.type('input._1wkJd[placeholder="Search for area, street name…"]', location, { delay: 100 });

  // Wait for the suggestions to appear
  await page.waitForSelector('div._11n32', { visible: true, timeout: 60000 });

  // Click the first suggestion
  await page.click('div._11n32');

  // Wait for the suggestions to appear
  await page.waitForSelector('div._2xPHa', { visible: true, timeout: 60000 });

  // Click the first suggestion
  await page.click('div._2xPHa');

  // Wait for the search bar container and focus it
  await page.waitForSelector('div._1AaZg', { visible: true, timeout: 60000 });
  await page.click('div._1AaZg');

  const product = process.argv[3];
  // Simulate slow typing
  await page.keyboard.type(` ${product}`, { delay: 900 });

  // Press Enter to initiate the search
  await page.keyboard.press('Enter');

  // Wait for results to load
  await page.waitForSelector('div.XjYJe', { visible: true, timeout: 30000 });

  // Click on the div with class _1u9_8
  await page.waitForSelector('div._1u9_8', { visible: true, timeout: 30000 });
  await page.click('div._1u9_8');

  // Press PageDown 20 times
  for (let i = 0; i < 20; i++) {
    await page.keyboard.press('PageDown');
    await new Promise(resolve => setTimeout(resolve, 500)); // Small delay to allow content to load
  }

  // Extract data after scrolling and dynamic loading
  let data = await page.evaluate(() => {
    const items = document.querySelectorAll('div.XjYJe');
    return Array.from(items).map(item => {
      const discount = item.querySelector('div[data-testid="item-offer-label-discount-text"]')?.innerText || 'No discount';
      const imageElement = item.querySelector('img.sc-iGgWBj.bnWvUc._1NxA5');
      const image = imageElement ? imageElement.getAttribute('src') || imageElement.getAttribute('data-src') || 'No image' : 'No image';
      const productName = item.querySelector('div.novMV')?.innerText || 'No product name';
      const quantity = item.querySelector('div[data-testid="item-quantity"] div.novMV')?.innerText || 'No quantity';
      const mrp = item.querySelector('div._20HCb div._22HSK span[data-testid="itemOfferPrice"] div')?.innerText || 'No price';
      const price = item.querySelector('div._20HCb div._22HSK span[data-testid="itemMRPPrice"] div')?.innerText || 'No MRP';

      return { discount, image, productName, quantity, price, mrp };
    });
  });

  // Limit the data to 20 items
  data = data.slice(0, 20);

  console.log('Data from Swiggy:', data);

  // Optionally close the browser when done
  await browser.close();
})();
