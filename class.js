const puppeteer = require('puppeteer');
const fs = require('fs');

const course = '2fa3'
const classlist = require(`./data/${course}.json`).arr

const username = process.env.FB_USERNAME
const password = process.env.FB_PASSWORD


let launchOptions = {
    headless: true,
    defaultViewport: {
        width: 1200,
        height: 600
    },
}
async function lookupClass() {
    const browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage(); 
    await page.setDefaultTimeout(5000);
    
    const context = browser.defaultBrowserContext();
    context.overridePermissions("https://www.facebook.com", ["geolocation", "notifications"]);
    
    await page.goto('https://facebook.com')

    //login
    await page.waitForSelector('#email')
    await page.type('#email',username)
    await page.type('#pass',password)
    await page.click('button[type=submit]')

    fs.writeFile(`data/${course}.csv`, 'FB Name,A2L Name,Friends,Mutuals,Url,Role\n', function (err) {
        if (err) throw err;
    });
    
    let results = await (async function loop(page, classlist) {
        let promises = [];
        for (let i = 0; i < classlist.length; i++) {
            promises.push(await load(page, i));
            process.stdout.write(`\r\x1b[KScraping... ${parseInt((i+1)/classlist.length*100)}%`,-1);
        }
        process.stdout.write("\n")
        // when all promises have been resolved continue
        return Promise.allSettled(promises);
    })(page, classlist)

    browser.close()
}

async function load(page, index) {
    let classmate = classlist[index].name
    try {
        // click on searchbar, type then hit enter
        await page.waitForSelector('input[type="search"]',{visible: true})
        await page.click('div[data-pagelet="root"] > div:first-child > div:first-child > div:first-child > label')
        await page.type('input[type="search"]', classmate)
        await page.type('input[type="search"]', String.fromCharCode(13))

        // click first link
        await page.waitForSelector('div[aria-label="Search Results"] a[role="link"]',{visible: true})
        await page.click('div[aria-label="Search Results"] a[role="link"]')

        // collect data
        let friends = false, 
            mutuals = 0;
        await page.waitForSelector('div[role="main"] h1', {visible: true})
        let name = await page.$eval('div[role="main"] h1',x => x.innerText)
        name = name.replace('\n',' ')

        // see if friends button exists
        try {
            await page.waitForSelector('div[aria-label="Friends"]', { timeout: 500 })
            friends = true
        } catch (e) {}
        // see if mutuals text exists
        try {
            let mutualsText = await page.$eval('div[role="main"] > div:nth-child(4) > div:first-child a:not([aria-label])',x => x.innerText)
            mutuals = parseInt(mutualsText.split(' Mutual')[0])
        } catch (e) {}

        let data = name+','+              
                classmate+','+
                friends+','+
                mutuals+','+              
                page.url()+','+
                classlist[index].role+'\n';
        if (mutuals > 0 || friends) {
            fs.appendFile(`data/${course}.csv`, data, function (err) {
                if (err) throw err;
            });
        }
    } catch(e) {     
        process.stdout.write(`\r\x1b[KError scraping ${classmate} at index ${index}\n`);
    }
}

lookupClass()

// -------------AVENUE CLASS LIST SCRAPER-------------
// len = document.querySelectorAll('#z_h > tbody > tr').length + 1
// str='{\n\t"arr":[\n'
// for (i=2; i<len;i++){
//     name = document.querySelector(`#z_h > tbody > tr:nth-child(${i}) > th`).innerText.split(', ').reverse().join(' ')
//     role = document.querySelector(`#z_h > tbody > tr:nth-child(${i}) > td:nth-child(5)`).innerText.split(' ')[0]
//     str = str.concat(`\t\t{\n\t\t\t"name":"${name}",\n\t\t\t"role":"${role}"\n\t\t},\n`)
// }
// console.log(str.concat('\t]\n}'))