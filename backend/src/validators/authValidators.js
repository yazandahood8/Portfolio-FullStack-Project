// src/validators/authValidators.js
import Joi from 'joi';

export const registerSchema = Joi.object({
  full_name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phone: Joi.string().allow(null, '').max(20),
  location: Joi.string().allow(null, '').max(100),
  profile_image_url: Joi.string().uri().allow(null, ''),
  linkedin_url: Joi.string().uri().allow(null, ''),
  github_url: Joi.string().uri().allow(null, ''),
  youtube_url: Joi.string().uri().allow(null, ''),
  bio: Joi.string().allow(null, '')
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});
