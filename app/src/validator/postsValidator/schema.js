import Joi from "joi";

const postsSchema = Joi.object({
  content: Joi.string().required(),
  tags: Joi.array().items(Joi.string()).required(),
});

export default postsSchema;
