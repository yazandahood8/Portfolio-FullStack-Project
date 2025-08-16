// src/validators/blogPostCommentValidators.js
import Joi from 'joi';

export const blogPostCommentSchema = Joi.object({
  post_id: Joi.string().guid({ version: 'uuidv4' }).required(),
  text: Joi.string().min(1).max(2000).required(),
  // Optionally allow author_name for anonymous/external comment
  author_name: Joi.string().max(120).allow('', null),
});
