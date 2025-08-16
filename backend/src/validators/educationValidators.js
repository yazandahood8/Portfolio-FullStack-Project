import Joi from 'joi';

export const educationSchema = Joi.object({
  school_name: Joi.string().min(1).max(200).required(),
  degree: Joi.string().max(100).allow('', null),
  field_of_study: Joi.string().max(150).allow('', null),
  start_date: Joi.date().allow(null, ''),
  end_date: Joi.date().allow(null, ''),
  is_current: Joi.boolean().default(false),
  description: Joi.string().max(1000).allow('', null),
});
