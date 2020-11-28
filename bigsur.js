const puppeteer = require('puppeteer');

let launchOptions = {
    headless: true
}
async function checkBigSur() {
    const browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();

    await page.goto('https://apps.apple.com/ca/app/macos-big-sur/id1526878132'); 

    let version = await page.$eval('.whats-new__latest__version', el => el.innerText)

    let message = version !== "Version 11.0.1" ? `UPDATE! Big Sur is now on ${version}` : 'No update yet'

    console.log(message);

    await browser.close()
}

checkBigSur()