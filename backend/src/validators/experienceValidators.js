// src/validators/experienceValidators.js
import Joi from 'joi';

export const experienceSchema = Joi.object({
  job_title: Joi.string().min(1).max(100).required(),
  company_name: Joi.string().min(1).max(100).required(),
  location: Joi.string().max(100).allow(null, ''),
  start_date: Joi.date().iso().required(),
  end_date: Joi.date().iso().greater(Joi.ref('start_date')).allow(null),
  is_current: Joi.boolean().default(false),
  description: Joi.string().allow(null, '')
});
