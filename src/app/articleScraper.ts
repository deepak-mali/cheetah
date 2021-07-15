import puppeteer from 'puppeteer';

import { logger, initBrowser,	createPage, blockAssets, search } from '../utils';

type Article = Record<string, string>;

/**
 * @description - scraper fucntion for articles.
 * @param { string> } searchTerm - keyword to search in browser.
 * @param { number } maxPageNumber - Maximum number of search pages to scrape.
 * @returns { Promise<Article[]> } Array of metadata of articles.
 */
export const articleScraper = async(searchTerm: string, maxPageNumber: number): Promise<Article[]> => {
	logger.info(`starting the process...`);
	let browser: puppeteer.Browser;
	browser = await initBrowser();
	const page: puppeteer.Page = await createPage(browser);
	await page.setRequestInterception(true);

	// Get the bgasy URL.
	const data = await Promise.all([
		blockAssets(page),
		search(page, searchTerm)
	]);

	// Run bgasy and article scraping logic in parallel.
	const response = await Promise.all([
		bgasyOperation(browser, data[0]),
		getArticles(page, maxPageNumber)
	]).catch(err => logger.error(err));

	// find the first word and google search it on the page.
	if (response && response[0] && !(response[0] === 'FETCH_FAILED')) {
		const firstWord = getFirstWord(response[0]);
		await search(page, firstWord);
	} else {
		logger.warn(`Error occured while fetching the bgasy response: ${response[0]}`);
	}

	logger.info('closing the browser...');
	await browser.close();
	return response[1];
};

/**
 * @description Get the search result page URLs.
 * @param { puppeteer.Page } page
 * @returns { Promise<string[]> } Array of URLs for next search result pages
 */
const getPageUrl = async (page: puppeteer.Page): Promise<string[]>  => page.$$eval('a[aria-label*="Page"]', (elements: HTMLAnchorElement[]) => elements.map(a => a.href));

/**
 * @description scrape the articles from the search result page till maxPageNumber is reached.
 * @param { puppeteer.Page } page
 * @param { number } maxPageNumber
 * @returns { Promise<Article[]> }
 */
const getArticles = async (page: puppeteer.Page,  maxPageNumber: number): Promise<Article[]> => {
	let result: Article[] = [];
	const nextPageUrls = await getPageUrl(page);

	// Scrape articles from first page.
	logger.info(`scraping result page number: 1`);
	result = result.concat(await scrapeArticlesOffPage(page));

	// Scrape articles from second page onwards.
	for (let i = 0; i < maxPageNumber - 1; i++) {
		logger.info(`scraping result page number: ${i + 2}`);
		await page.goto(nextPageUrls[i], { waitUntil: 'networkidle2' });
		result = result.concat(await scrapeArticlesOffPage(page));
	}
	logger.info(`found ${result.length} articles`);
	console.log(result);
	return result;
};

/**
 * @description scrape articles off a search result page.
 * @param { puppeteer.Page } page
 * @returns { Promise<Article[]> }
 */
const scrapeArticlesOffPage = async (page: puppeteer.Page): Promise<Article[]> => {
	const meta = await scrapeArticle(page).catch(err => {
		logger.warn(`Error during scraping articles: ${err}`);
		return [];
	});
	return meta;
};

/**
 * @description scrape article title and link.
 * @param { puppeteer.Page } page
 * @returns { Promise<Article[]> }
 */
const scrapeArticle = async (page: puppeteer.Page): Promise<Article[]> => page.$$eval('.yuRUbf > a', (elements: HTMLAnchorElement[]) => {
		const result = [];
		elements.map(a => {
			result.push({
				link: a.href,
    		title: a.querySelector('h3').innerText
			});
		});
		return result;
	});

/**
 * @description open anew tab an fetch the bgasy response.
 * @param { puppeteer.Browser } browser
 * @param { string } url
 * @returns { Promise<string> }
 */
const bgasyOperation = async (browser: puppeteer.Browser, url: string): Promise<string> => {
	const page = await browser.newPage();
	// TODO: Find a way to bypass cors error on new-tab.
	await page.goto('https://www.google.com');
	const data = await page.evaluate((url) => window.fetch(url)
		.then(data => data.text())
		.catch(err => 'FETCH_FAILED'), url);
	await page.close();
	return data;
};

/**
 * @description get the first word of a multi-line string
 * @param { string } data
 * @returns { string }
 */
const getFirstWord = (data: string): string => {
	const firstRow = data.split('\n')[0];
	const firstWord = firstRow.split(' ')[0];
	return firstWord;
};