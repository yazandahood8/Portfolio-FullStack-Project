// backend/src/validators/projectValidators.js
import Joi from 'joi';

function optionalUri() {
  // Accepts: undefined, null, '', or a real valid http(s) url
  return Joi.alternatives().try(
    Joi.string().uri({ scheme: ['http', 'https'] }),
    Joi.valid(null),
    Joi.valid('')
  );
}

export const projectSchema = Joi.object({
  project_name: Joi.string().min(1).max(150).required(),
  short_description: Joi.string().max(300).allow(null, ''),
  long_description: Joi.string().allow(null, ''),
  thumbnail_url: optionalUri(),
  github_url: optionalUri(),
  live_url: optionalUri(),
  video_url: optionalUri(),
  tech_stack: Joi.array().items(Joi.string().max(50)).required(),
  priority: Joi.number().integer().min(0).default(0)
}).unknown();
