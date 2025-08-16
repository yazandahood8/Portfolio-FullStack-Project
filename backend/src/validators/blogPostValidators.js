// src/validators/blogPostValidators.js
import Joi from 'joi';

export const blogPostSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  slug: Joi.string()
    .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .required(),
  excerpt: Joi.string().max(500).allow(null, ''),
  content: Joi.string().required(),
cover_image_url: Joi.string()
  .custom((value, helpers) => {
    try {
      // Accept absolute URI
      new URL(value);
      return value;
    } catch {
      // Accept relative path that starts with /uploads/
      if (/^\/uploads\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(value)) return value;
      return helpers.error('any.invalid');
    }
  }, 'URL or Upload Path')
  .allow('', null)
  .messages({
    'any.invalid': 'cover_image_url must be a valid URL or upload path'
  }),
    published_at: Joi.date().iso().allow(null)
});
