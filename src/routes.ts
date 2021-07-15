import { Application, Request, Response } from 'express';

import * as controller from './app';
import { logger } from './utils';
import * as validator from './validators';

/**
 * @description - API endpoints declarations.
 * @param app - express server.
 */
export const routes = (app: Application): void => {
	// Route for addition functionality.
	app.post('/article', validator.article, async (request: Request, response: Response) => {
		logger.info(`sending request payload for scraping the articles...`);
		const { keyword, pageNumber } = request.body as Record<string, string | number>;
		const result = await controller.articleScraper(keyword as string, pageNumber as number);
		logger.info(`sending back the response...`);
		return response.status(200).json(result);
	});
};
