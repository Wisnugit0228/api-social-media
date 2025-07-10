import mongoose from "mongoose";

const postsSchema = new mongoose.Schema({
  _id: {
    type: String,
    require: true,
  },
  user_id: {
    type: String,
    ref: "User",
  },
  content: {
    type: String,
    require: true,
  },
  media_url: {
    type: String,
    default: null,
  },
  media_key: {
    type: String,
    default: null,
  },
  tags: [
    {
      type: String,
      require: true,
    },
  ],
  created_at: {
    type: String,
  },
  likes: [
    {
      type: String,
    },
  ],
});

export default mongoose.model("Posts", postsSchema);
