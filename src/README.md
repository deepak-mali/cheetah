# Cheetah
Cheetah is a simple, minimalistic web scraper. It uses [Puppeteer](https://github.com/puppeteer/puppeteer) under the hood for browser. Cheetah takes a search keyword and number(optional) of result page to scrape. It returns list of articles containing article title and link.

---
**Installation Steps:**
```
git clone git@github.com:deepak-mali/cheetah.git
cd cheetah
npm install

To start the dev server:
npm run start:dev

To run unit tests:
npm run test (Work in progress)

To run test coverage:
npm run test:coverage (Work in progress)

```
**API calls**
```
curl --location --request POST 'http://localhost:3000/article' \
--header 'Content-Type: application/json' \
--data-raw '{
    "keyword": "monsoon in india",
    "pageNumber": 5
}'
```