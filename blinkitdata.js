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

  // Set viewport to simulate a desktop device
  await page.setViewport({ width: 1920, height: 1080 });

  // Set user agent
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

  // Go to Blinkit website
  await page.goto('https://www.blinkit.com', { waitUntil: 'networkidle2' });

  // Set location to Kolkata
  await page.waitForSelector('input[name="select-locality"]');
  await page.type('input[name="select-locality"]', location, { delay: 300 });
  await page.waitForSelector('.LocationSearchList__LocationListContainer-sc-93rfr7-0.lcVvPT', { visible: true });
  const firstSuggestion = await page.$('.LocationSearchList__LocationListContainer-sc-93rfr7-0.lcVvPT');
  if (firstSuggestion) {
    await firstSuggestion.click();
  }

  // Wait for page update after setting location
  await new Promise(r => setTimeout(r, 5000));

  // Search for 'safola oil'
  await page.waitForSelector('.SearchBar__Container-sc-16lps2d-3');
  await page.click('.SearchBar__Container-sc-16lps2d-3');
  const product = process.argv[3];
  await page.keyboard.type(` ${product}`, { delay: 900 });
  await page.keyboard.press('Enter');

  // Wait for search results to load by waiting for the first product element
  await page.waitForSelector('.Product__UpdatedPlpProductContainer-sc-11dk8zk-0', { visible: true });

  // Extract product data
  const productData = await page.evaluate(() => {
    const products = [];
    const productElements = document.querySelectorAll('.Product__UpdatedPlpProductContainer-sc-11dk8zk-0');

    productElements.forEach(product => {
      const title = product.querySelector('.Product__UpdatedTitle-sc-11dk8zk-9')?.innerText || '';
      const variant = product.querySelector('.plp-product__variant')?.innerText || '';
      const price = product.querySelector('.Product__UpdatedPriceAndAtcContainer-sc-11dk8zk-10 div:first-child div:first-child')?.innerText || '';
      const oldPrice = product.querySelector('.Product__UpdatedPriceAndAtcContainer-sc-11dk8zk-10 div:first-child div:nth-child(2)')?.innerText || '';
      const image = product.querySelector('.Product__UpdatedImageContainer-sc-11dk8zk-3 img')?.src || '';
      const offer = product.querySelector('.Product__UpdatedOfferTitle-sc-11dk8zk-2')?.innerText || '';

      products.push({
        title,
        variant,
        price,
        oldPrice,
        image,
        offer
      });
    });

    return products;
  });

  console.log('Data from Blinkit:', productData);

  // Close the browser if needed
  await browser.close();
})();
