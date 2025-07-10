import mongoose from "mongoose";

export const connectionDB = () => {
  const uri = process.env.MONGO_URL;
  mongoose
    .connect(uri)
    .then(() => console.log(`mongoDb Connected on ${uri}`))
    .catch((err) => console.log(err));
};
