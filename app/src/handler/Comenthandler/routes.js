import express from "express";
import verifyToken from "../../middleware/verifyToken.js";
import { postComentHandler } from "./handler.js";

const comentsRoutes = express.Router();
comentsRoutes.post("/comments/:postId", verifyToken, postComentHandler);

export default comentsRoutes;
