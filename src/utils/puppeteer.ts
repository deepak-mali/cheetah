import puppeteer from 'puppeteer';

import { logger } from '.';

/**
 * @description Initialize a browser.
 * @returns { Promise<puppeteer.Browser> }
 */
export const initBrowser = async (): Promise<puppeteer.Browser> => {
	logger.info('launching a browser...');
	return puppeteer.launch({
		args: [
			'--no-sandbox',
			'--disable-gpu',
			'--window-size=1920x1080'
		],
		devtools: false,
		headless: true
	});
};

/**
 * @description create a new tab in the browser
 * @param { puppeteer.Browser } browser
 * @returns { Promise<puppeteer.Page> }
 */
export const createPage = async (browser: puppeteer.Browser): Promise<puppeteer.Page> => {
	logger.info('creating a new page...');
	return browser.newPage();
};

/**
 * @description Google search the searchTerm.
 * @param { puppeteer.Page } page
 * @param { string } searchTerm
 * @returns {Promise<puppeteer.Response> }
 */
export const search = async (page: puppeteer.Page, searchTerm: string): Promise<puppeteer.Response> => {
	logger.info(`searching for ${searchTerm}...`);
	return page.goto(`https://www.google.com/search?q=${searchTerm}`, { waitUntil: 'domcontentloaded' });
};

/**
 * @description intercept request to block assest and get the url of bgsy request.
 * @param { puppeteer.Page } page
 * @returns { Promise<string> }
 */
export const blockAssets = async (page: puppeteer.Page): Promise<string> => new Promise((resolve, reject) => {
		try {
			page.on('request', (request) => {
				if (['font', 'image', 'stylesheet'].includes(request.resourceType())) {
					request.abort();
				} else if (request.url().includes('bgasy')){
					resolve(request.url());
				} else {
					request.continue();
				}
			});
		} catch (err) {
			reject(err);
		}
	});

