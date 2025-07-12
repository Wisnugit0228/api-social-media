import express from "express";
import multer from "multer";
import verifyToken from "../../middleware/verifyToken.js";
import { addLikeHandler, deleteMyPostHandler, getMyPostHandler, getPostByFollowingHandler, postPostsHandler, putMyPostHandler } from "./handler.js";

const upload = multer({ storage: multer.memoryStorage() });
const postsRoute = express.Router();
postsRoute.post("/posts", verifyToken, upload.single("image"), postPostsHandler);
postsRoute.post("/addlike/:postId", verifyToken, addLikeHandler);
postsRoute.get("/mypost", verifyToken, getMyPostHandler);
postsRoute.put("/posts/:postId", upload.single("image"), verifyToken, putMyPostHandler);
postsRoute.delete("/posts/:postId", verifyToken, deleteMyPostHandler);
postsRoute.get("/posts", verifyToken, getPostByFollowingHandler);

export default postsRoute;
