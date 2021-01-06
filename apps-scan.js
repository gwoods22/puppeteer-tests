const puppeteer = require('puppeteer');
const apps = require('./data/apps.json').apps

let launchOptions = {
    headless: true
}
async function checkPiratedApps() {
    const browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();    
    
    let results = await (async function loop(page, apps) {
        let promises = [];
        for (let i = 0; i < apps.length; i++) {
            promises.push(await load(page, apps[i]));
            process.stdout.write("\r\x1b[K")
            process.stdout.write(`Scraping... ${parseInt((i+1)/apps.length*100)}%`);
        }
        process.stdout.write("\n")
        // when all promises have been resolved continue
        return Promise.allSettled(promises);
    })(page, apps)

    browser.close()

    results = results
                .map(x => x.value)
                .filter(x => !x.new );
    
    if ( results.length) {
        console.log("----Out of date apps----");
        for (let i = 0; i < results.length; i++) {
            console.log(results[i].name,"\n  ",results[i].url);
        }
    } else {
        console.log("All apps are up to date!");
    }
}

async function load(page, app) {
    await page.goto(app.url);
    let newName = await page.$eval(
        '#search-entries > article:first-child .search-entry-header-title a',
        x => x.innerText
    );
    app.new = newName === app.name
    return app
}

checkPiratedApps()