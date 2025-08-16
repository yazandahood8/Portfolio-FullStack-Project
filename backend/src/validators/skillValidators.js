// src/validators/skillValidators.js
import Joi from 'joi';

export const skillSchema = Joi.object({
  skill_name: Joi.string().min(1).max(100).required(),
  level: Joi.string()
    .valid('Beginner', 'Intermediate', 'Expert')
    .required(),
  category: Joi.string().max(50).allow(null, '')
});
