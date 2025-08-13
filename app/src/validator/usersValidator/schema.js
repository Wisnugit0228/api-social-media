import Joi from "joi";

export const usersSchema = Joi.object({
  username: Joi.string().required(),
  email: Joi.string().required(),
  password: Joi.string().required(),
  bio: Joi.optional(),
  image: Joi.optional(),
});

export const loginUserSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});
