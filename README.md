# Puppeteer Tests
Test repo for playing around with Puppeteer

Currently index.js scrapes http://mosaic.mcmaster.ca and takes a screenshot of your grades.

## Get Started Scraping Your McMaster Grades!

Run `yarn`

Add a .env file with values:
```
MOSAIC_USERNAME=___macID____
MOSAIC_PASSWORD=__password__
```

Run `npm start`

Your grade screenshot will be saved in /screenshots and raw grade text will be printed to the console.