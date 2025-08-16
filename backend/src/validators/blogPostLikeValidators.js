// src/validators/blogPostLikeValidators.js
import Joi from 'joi';

export const blogPostLikeSchema = Joi.object({
  post_id: Joi.string().guid({ version: 'uuidv4' }).required(),
  // user_id should come from auth/session, not client
});
