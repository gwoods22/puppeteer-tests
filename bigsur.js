const puppeteer = require('puppeteer');

let launchOptions = {
    headless: true
}
async function checkBigSur() {
    const browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();
    const version = "Version 11.1"

    await page.goto('https://apps.apple.com/ca/app/macos-big-sur/id1526878132'); 

    let newVersion = await page.$eval('.whats-new__latest__version', el => el.innerText)

    let message = version !== newVersion ? `UPDATE! Big Sur is now on ${version}` : `Still on ${version}`

    console.log(message);

    await browser.close()
}

checkBigSur()