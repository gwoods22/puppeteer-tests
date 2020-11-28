require('dotenv').config({ path: __dirname + "/.env" });
const notifier = require('node-notifier');
const puppeteer = require('puppeteer');

let launchOptions = {
    headless: true
}

async function scrape() {

    const browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();

    const url = 'https://www.bestbuy.ca/en-ca/product/sandisk-extreme-plus-128gb-170-mb-s-microsd-memory-card/12927936'

    await page.goto(url); 

    await page.waitForSelector('.x-nearby-stores > div:nth-child(3) span[data-automation="pickup-store-list-item-store-name"]')
    
    let loc1 = await page.$eval(
        '.x-nearby-stores > div:nth-child(1) span[data-automation="pickup-store-list-item-store-name"]',
    el => el.innerText)

    let loc2 = await page.$eval(
        '.x-nearby-stores > div:nth-child(2) span[data-automation="pickup-store-list-item-store-name"]',
    el => el.innerText)

    let loc3 = await page.$eval(
        '.x-nearby-stores > div:nth-child(3) span[data-automation="pickup-store-list-item-store-name"]',
    el => el.innerText)

    let na1 = await page.$eval(
        '.x-nearby-stores > div:nth-child(1) > div:nth-child(2) > span',
    el => el.innerText) !== "Not Available"

    let na2 = await page.$eval(
        '.x-nearby-stores > div:nth-child(2) > div:nth-child(2) > span',
    el => el.innerText) !== "Not Available"

    let na3 = await page.$eval(
        '.x-nearby-stores > div:nth-child(3) > div:nth-child(2) > span',
    el => el.innerText) !== "Not Available"

    let locations = na1+ na2+ na3
    
    let avail = ''
    if (na1) avail += loc1
    if (na1 && na2) avail += ' and '
    if (na2) avail += loc2
    if (na2 && na3 || na1 && na3) avail += ' and '
    if (na3) avail += loc3
    
    console.log(avail);

    if (na1 || na2 || na3) {
        notifier.notify({
            title: `GO! GO! GO!`,
            message: `Available in ${avail}!`,
            sound: 'Glass',
            open: url
        });
        console.log(na1 ? '✅' : '❌', loc1);
        console.log(na2 ? '✅' : '❌', loc2);
        console.log(na3 ? '✅' : '❌', loc3);
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
    }, 5*60*1000);
} else {
    scrape()
}
