require('dotenv').config({ path: __dirname + "/.env" });
const notifier = require('node-notifier');
const puppeteer = require('puppeteer');

let launchOptions = {
    headless: true
}

async function scrape() {

    const browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();

    const url = 'https://www.youtube.com/c/TaylorSwift/videos'

    await page.goto(url); 

    await page.waitForSelector('#items > ytd-grid-video-renderer:first-child #video-title')
    
    let vidTitle = await page.$eval(
        '#items > ytd-grid-video-renderer:first-child #video-title',
    el => el.innerText)
    
    let vidLink = await page.$eval(
        '#items > ytd-grid-video-renderer:first-child #video-title',
    el => el.href)

    if (vidTitle !== "Taylor Swift - exile (folklore: the long pond studio sessions | Disney+) ft. Bon Iver") {
        notifier.notify({
            title: `GO! GO! GO!`,
            message: vidTitle,
            sound: 'Glass',
            open: vidLink
        });
    } else {
        console.log(`Unavailable ${(new Date).getHours()}:${
            (new Date).getMinutes() < 10 ? '0'+(new Date).getMinutes() : (new Date).getMinutes()
        }:${
            (new Date).getSeconds() < 10 ? '0'+(new Date).getSeconds() : (new Date).getSeconds()
        }`);
    }

    await browser.close()
};

if (process.argv[2] === 'interval') {
    setInterval(() => {
        scrape();
    }, 30*1000);
} else {
    scrape()
}
