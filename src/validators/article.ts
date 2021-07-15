import Joi from '@hapi/joi';

import { logger } from '../utils';

const schema = Joi.object({
	body: {
		keyword: Joi.string().required(),
		pageNumber: Joi.number().optional().default(1)
	},
}).unknown(true);

export const article = (request, response, next) => {
	logger.info(`validating request for endpoint ${request.url}`);
	const result = Joi.validate(request, schema);
	if (result.error) {
		logger.info(`validating failed for endpoint ${request.url} with error ${result.error}`);
		return response.status(400).json({
			code : 400,
			message : `Bad Request: ${result.error}`,
		});
	}
	logger.info(`validated request...`);
	next();
};
