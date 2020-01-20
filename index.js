require('dotenv').config({ path: __dirname + "/.env" });
const puppeteer = require('puppeteer');

let launchOptions = {
    headless: true
}

/**
 * Main function that runs puppeteer through mosaic interface then scrapes grade text from page and takes a screenshot
 */
async function getGrades() {
    const start = new Date();
    const browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();
    await page.goto('https://epprd.mcmaster.ca/psp/prepprd/?cmd=login');  

    // username
    await page.waitFor("#userid");
    await page.type("#userid", process.env.MOSAIC_USERNAME);

    // password
    await page.waitFor("#pwd");
    await page.type("#pwd", process.env.MOSAIC_PASSWORD);

    // submit button
    await page.waitFor(".ps_box-button > span > input")
    await page.click(".ps_box-button > span > input")

    console.log('logged in');    
    
    // grades tile
    await page.waitFor(".ps_grid-div.ps_grid-body > div:nth-child(8)", {visible: true});
    await page.click(".ps_grid-div.ps_grid-body > div:nth-child(8)");

    console.log('grades tile clicked');
    
    //modal ok button
    await page.waitFor("#okbutton input", {visible: true});
    await page.click("#okbutton input");

    // get content iframe
    const target = await page.frames().find(f => f.name() === 'TargetContent')

    // change term
    await target.waitFor("#ACE_width .PSPUSHBUTTON.Left")
    await target.click("#ACE_width .PSPUSHBUTTON.Left");
    
    console.log('term selector loaded');

    // fall 2019
    await target.waitFor("#ACE_width > tbody > tr:nth-child(4) table table > tbody > tr:nth-child(3) input");
    await target.click("#ACE_width > tbody > tr:nth-child(4) table table > tbody > tr:nth-child(3) input");
    
    // submit button
    await target.waitFor("#ACE_width .PSPUSHBUTTON:not(.Left)");
    await target.click("#ACE_width .PSPUSHBUTTON:not(.Left)");

    console.log('term changed to Fall 2019');   
    
    //modal ok button
    await page.waitFor("#okbutton input", {visible: true});
    await page.click("#okbutton input");
    
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
    await page.screenshot({path: 'screenshots/grades.png'});

    const end = new Date();
    console.log('screenshot taken after: ', (end - start)/1000, 'seconds');

    await browser.close();
};
getGrades();