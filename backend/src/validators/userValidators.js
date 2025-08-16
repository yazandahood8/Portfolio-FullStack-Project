// src/validators/userValidators.js
import Joi from 'joi';

export const updateUserSchema = Joi.object({
  full_name: Joi.string().min(2).max(100),
  phone: Joi.string().max(20).allow(null, ''),
  location: Joi.string().max(100).allow(null, ''),
  profile_image_url: Joi.string().uri().allow(null, ''),
  linkedin_url: Joi.string().uri().allow(null, ''),
  github_url: Joi.string().uri().allow(null, ''),
  youtube_url: Joi.string().uri().allow(null, ''),
  about: Joi.string().allow(null, ''),

  bio: Joi.string().allow(null, '')
}).min(1); // require at least one field
