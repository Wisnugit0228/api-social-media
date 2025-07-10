import express from "express";
import multer from "multer";
import verifyToken from "../../middleware/verifyToken.js";
import { addFollowHandler, getuserByIdHandler, getUsersHandler, LoginUserHandler, LogoutUserHandler, postUserHandler, putUserByIdHandler, RefreshTokenHandler } from "./handler.js";

const upload = multer({ storage: multer.memoryStorage() });

const usersRouter = express.Router();
usersRouter.post("/register", upload.single("image"), postUserHandler);
usersRouter.post("/login", LoginUserHandler);
usersRouter.get("/users/:id", verifyToken, getuserByIdHandler);
usersRouter.get("/users", verifyToken, getUsersHandler);
usersRouter.get("/refreshtoken", RefreshTokenHandler);
usersRouter.post("/follow/:targetUsername", verifyToken, addFollowHandler);
usersRouter.delete("/logout", LogoutUserHandler);
usersRouter.put("/users/:id", upload.single("image"), verifyToken, putUserByIdHandler);

export default usersRouter;
