require('dotenv').config({ path: __dirname + "/.env" });
const puppeteer = require('puppeteer');

let launchOptions = {
    headless: false
}

/**
 * Main function that runs puppeteer through mosaic interface then scrapes grade text from page and takes a screenshot
 */
async function getGrades() {

    const browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();

    const start = new Date();
    await page.goto('https://epprd.mcmaster.ca/psp/prepprd/?cmd=login');  

    // username
    await page.waitForSelector("#userid");
    await page.type("#userid", process.env.MOSAIC_USERNAME);

    // password
    await page.waitForSelector("#pwd");
    await page.type("#pwd", process.env.MOSAIC_PASSWORD);

    // submit button
    await page.waitForSelector(".ps_box-button > span > input")
    await page.click(".ps_box-button > span > input")

    console.log('logged in');    
    
    // grades tile
    await page.waitForSelector(".ps_grid-div.ps_grid-body > div:nth-child(9) > div:nth-child(1) > div", {visible: true});
    await page.click(".ps_grid-div.ps_grid-body > div:nth-child(9) > div:nth-child(1) > div");

    console.log('grades tile clicked');
    
    // modal ok button
    // await page.waitForSelector("#okbutton input", {visible: true});
    // await page.click("#okbutton input");
    
    //wait for iFrame
    await page.waitForSelector("#ptifrmtarget")
    await page.waitForTimeout(1000)

    // get content iframe
    const target = await page.frames().find(f => f.name() === 'TargetContent')

    // change term
    // await target.waitForSelector("#ACE_width .PSPUSHBUTTON.Left")
    // await target.click("#ACE_width .PSPUSHBUTTON.Left");   

    // fall 2019
    await target.waitForSelector("#ACE_width > tbody > tr:nth-child(4) table table > tbody > tr:nth-child(3) input");
    await target.click("#ACE_width > tbody > tr:nth-child(4) table table > tbody > tr:nth-child(3) input");
    
    // submit button
    await target.waitForSelector("#ACE_width .PSPUSHBUTTON:not(.Left)");
    await target.click("#ACE_width .PSPUSHBUTTON:not(.Left)");

    console.log('term changed to Fall 2020');   
    
    //modal ok button
    await page.waitForSelector("#okbutton input", {visible: true});
    await page.click("#okbutton input");
    
    await page.waitForSelector("#ptifrmtarget")

    // get new content iframe
    const newTarget = await page.frames().find(f => f.name() === 'TargetContent');

    // get raw grade data
    const gradeData = await newTarget.evaluate(() => {
        let rows = Array.from(document.querySelectorAll(".PSLEVEL1GRID > tbody > tr")).slice(1)
        return rows.map(el => {
            let textArr = el.innerText.split('\n');
            return textArr.filter( (el) => /\S/.test(el) );
        })
    });

    console.log('Grade Data:');
    console.log(gradeData);
    
    // take screenshot
    // await page.screenshot({path: 'grades.png'});

    const end = new Date();
    console.log('scraped after: ', (end - start)/1000, 'seconds');

    await browser.close()
};

getGrades()