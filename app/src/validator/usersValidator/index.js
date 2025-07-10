import { loginUserSchema, usersSchema } from "./schema.js";

const usersValidator = {
  usersValidate: (payload) => {
    const { error } = usersSchema.validate(payload);
    if (error) {
      throw new Error(error.message);
    }
  },

  loginUserValidate: (payload) => {
    const { error } = loginUserSchema.validate(payload);
    if (error) {
      throw new Error(error.message);
    }
  },
};

export default usersValidator;
