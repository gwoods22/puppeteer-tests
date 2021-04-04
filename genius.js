require('dotenv').config({ path: __dirname + "/.env" });
// const notifier = require('node-notifier');
const puppeteer = require('puppeteer');

let launchOptions = {
    headless: true
}

// -----scrape links for an album-----
// arr = document.querySelectorAll('album-tracklist-row a')
// res=[]
// for (i=0; i<arr.length; i++){res.push(arr[i].getAttribute('href'))}
// res.join('\n')
let links = [
    "https://genius.com/Arkells-private-school-lyrics",    
    "https://genius.com/Arkells-my-hearts-always-yours-lyrics",
    "https://genius.com/Arkells-savannah-lyrics",
    "https://genius.com/Arkells-passenger-seat-lyrics",
    "https://genius.com/Arkells-making-due-lyrics",
    "https://genius.com/Arkells-round-and-round-lyrics",
    "https://genius.com/Arkells-hung-up-lyrics",
    "https://genius.com/Arkells-come-back-home-lyrics",
    "https://genius.com/Arkells-a-little-rain-a-song-for-pete-lyrics",
    "https://genius.com/Arkells-and-then-some-lyrics",
    "https://genius.com/Arkells-hangs-the-moon-lyrics",
    "https://genius.com/Arkells-fake-money-lyrics",
    "https://genius.com/Arkells-come-to-light-lyrics",
    "https://genius.com/Arkells-cynical-bastards-lyrics",
    "https://genius.com/Arkells-11-11-lyrics",
    "https://genius.com/Arkells-never-thought-that-this-would-happen-lyrics",
    "https://genius.com/Arkells-dirty-blonde-lyrics",
    "https://genius.com/Arkells-what-are-you-holding-on-to-lyrics",
    "https://genius.com/Arkells-hey-kids-lyrics",
    "https://genius.com/Arkells-leather-jacket-lyrics",
    "https://genius.com/Arkells-crawling-through-the-window-lyrics",
    "https://genius.com/Arkells-systematic-lyrics",
]

async function scrape() {

    const browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();

    await page.goto('https://genius.com/signup')

    // login
    await page.waitForSelector('.header-action--sign_in')
    await page.click('.header-action--sign_in')
    await page.waitForSelector('#user_session_login')
    await page.type('#user_session_login', 'itsabop')
    await page.type('#user_session_password', 'W00dzy!!')
    await page.click('#user_session_submit')
    await page.waitForSelector('.profile_identity')

    process.stdout.write('\r\x1b[KScraping... 0%')
    
    let results = await (async function loop(page) {
        let promises = [];
        for (let i = 0; i < links.length; i++) {
        // for (let i = 0; i < 3; i++) {
            promises.push(await credits(page, links[i], i));
            process.stdout.write(`\r\x1b[KScraping... ${parseInt((i+1)/links.length*100)}%`,-1);
        }
        process.stdout.write('\n');
        // when all promises have been resolved continue
        return Promise.allSettled(promises);
    })(page)
    
    console.log('Success for:');
    console.log('\t'+results.map(x => x.value).join('\n'));
    await browser.close()   
};

if (process.argv[2] === 'interval') {
    setInterval(() => {
        scrape();
    }, 30*1000);
} else {
    scrape()
}


async function credits(page, link, index) {   
    let title = link.split('-').slice(1,-1).map(x => x.charAt(0).toUpperCase()+x.slice(1)).join(' ')
    try {
        await page.goto(link); 
    
        // open credit panel
        await page.waitForSelector('.lyrics_controls > button')
        await page.click('.lyrics_controls > button')
        
        // add another credit field
        await page.waitForSelector('metadata-custom-performance-role-input .text_label--button')
        await page.click('metadata-custom-performance-role-input .text_label--button')

        let creditFields = await page.$$eval(
            'metadata-custom-performance-role-input > .square_form-sub_section',
            el => el.length
        )

        // type role
        await page.type(
            `metadata-custom-performance-role-input > .square_form-sub_section:nth-child(${creditFields}) [label="Additional role"] input`,
            'Copyright©'
        )
        // type artist
        await page.type(
            `metadata-custom-performance-role-input > .square_form-sub_section:nth-child(${creditFields}) [label="Artists in the role"] input`,
            'Arkells Music Inc'
        )
        await page.waitForTimeout(1000)
        
        // hit enter then save
        await page.type(
            `metadata-custom-performance-role-input > .square_form-sub_section:nth-child(${creditFields}) [label="Artists in the role"] input`,
            String.fromCharCode(13)
        )
        await page.click('.modal_window-save_button')

        // wait for iq notification
        await page.waitForSelector('.iq_notification_list .iq_notification-action--positive')
        await page.waitForTimeout(500)

        return title
    } catch(e) {     
        process.stdout.write(`\r\x1b[KError scraping ${title} at index ${index}\n`);
    }
}