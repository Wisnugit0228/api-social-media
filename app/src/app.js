import express, { json } from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectionDB } from "./db/dbConnections.js";
import usersRouter from "./handler/usersHandler/routes.js";
import postsRoute from "./handler/postsHandler/routes.js";
import comentsRoutes from "./handler/Comenthandler/routes.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000",
  })
);
app.use(cookieParser());
//db connection
connectionDB();

app.use(usersRouter);
app.use(postsRoute);
app.use(comentsRoutes);

app.listen(5000, () => console.log("server running on port 3000"));
