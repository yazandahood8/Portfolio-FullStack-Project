import Joi from 'joi';

export const volunteeringSchema = Joi.object({
  organization: Joi.string().max(200).required(),
  role: Joi.string().max(150).allow('', null),
  location: Joi.string().max(150).allow('', null),
  start_date: Joi.date().allow(null, ''),
  end_date: Joi.date().allow(null, ''),
  is_current: Joi.boolean().default(false),
  description: Joi.string().max(1000).allow('', null),
});
