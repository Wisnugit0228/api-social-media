import express from "express";
import multer from "multer";
import verifyToken from "../../middleware/verifyToken.js";
import { addLikeHandler, postPostsHandler } from "./handler.js";

const upload = multer({ storage: multer.memoryStorage() });
const postsRoute = express.Router();
postsRoute.post("/posts", verifyToken, upload.single("image"), postPostsHandler);
postsRoute.post("/addlike/:postId", verifyToken, addLikeHandler);

export default postsRoute;
