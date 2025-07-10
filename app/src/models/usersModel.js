import mongoose from "mongoose";

const usersSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    unique: true,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  bio: {
    type: String,
    default: "",
  },
  avatar_url: {
    type: String,
    default: "",
  },
  key: {
    type: String,
    default: "",
  },
  refresh_token: {
    type: String,
  },
  created_at: {
    type: String,
  },
  followers: [
    {
      type: String,
      ref: "Users",
    },
  ],
  following: [
    {
      type: String,
      ref: "Users",
    },
  ],
});

export default mongoose.model("Users", usersSchema);
