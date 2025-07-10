import postsSchema from "./schema.js";

const postsValidator = {
  postsValidate: (payload) => {
    const { error } = postsSchema.validate(payload);
    if (error) {
      throw new Error(error.message);
    }
  },
};

export default postsValidator;
