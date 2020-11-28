/*
 *Example of nested for loops of awaits running sequentially in order
 */

async function go() {
    const browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();
    console.log('waiting for page');

        // immediately invoked function that runs scrape functions asynchronously one by one
    let results = await (async function loop(page) {
        let promises = [];
        for (let i = 1; i < 4; i++) {
            promises.push(await load(page, i));
        }
        // when all promises have been resolved continue
        return Promise.allSettled(promises);
    })(page)
    
    console.log("Results:");
    console.log(results.map(x => x.value));
    browser.close()
    
}

async function load(page, i) {
    let results = await (async function loop(page) {
        let promises = [];
        for (let j = 1; j < 4; j++) {
            await page.goto(`https://www.theverge.com/apple/archives/${i}`);

            promises.push(await refresh(page, j));
            console.log('Refresh ', j, ' on page ', i, ' scraped.')
        }
        // when all promises have been resolved continue
        return Promise.allSettled(promises);
    })(page, i)
    return results.map(x => x.value)
}

//[product, 'published', rating, '', authorDate[0], '', '', text, '', new Date(authorDate[1]).toUTCString(), '']

async function refresh(page,j) {    
    return await page.$eval(`#rock-featured-video ol > li:nth-child(${j}) .c-rock-list__item--body > span`, x => x.innerText);
}