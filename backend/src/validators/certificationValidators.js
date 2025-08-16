import Joi from 'joi';

export const certificationSchema = Joi.object({
  name: Joi.string().max(200).required(),
  organization: Joi.string().max(150).allow('', null),
  credential_id: Joi.string().max(100).allow('', null),
  credential_url: Joi.string().uri().allow('', null),
  issued_date: Joi.date().allow(null, ''),
  expiration_date: Joi.date().allow(null, ''),
  does_not_expire: Joi.boolean().default(false),
  description: Joi.string().max(1000).allow('', null)
});
