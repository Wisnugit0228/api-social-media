import mongoose from "mongoose";

const comentSchema = new mongoose.Schema({
  _id: {
    type: String,
    require: true,
  },
  post_id: {
    type: String,
    ref: "Post",
  },
  user_id: {
    type: String,
    ref: "User",
  },
  content: {
    type: String,
    require: true,
  },
  created_at: {
    type: String,
  },
});

export default mongoose.model("Coments", comentSchema);
