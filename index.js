import express from "express";
import * as dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

import adminRouter from "./routes/Admin.js";
import userRouter from "./routes/User.js";
import authRoute from "./routes/Auth.js";
import { Check } from "./util/envCheck.js";

const app = express();
app.use(cookieParser());

const corsOptions = {
  origin: [process.env.FRONTEND_HOST, "http://localhost:3000"],
  credentials: true,
};
app.use(cors(corsOptions));

app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
app.use(bodyParser.json({ limit: "50mb" }));

app.use("/", userRouter);
app.use("/user/auth", authRoute);
app.use("/admin", adminRouter);

app.get("/healthcheck", (req, res) => {
  res.status(200).send("Server is running");
});

if (!Check.verifyEnvironment()) {
  throw Error("Please include all environment variable");
}

const PORT = process.env.PORT;
const DB_CONNECTION_URL = process.env.DB_CONNECTION_URL;

mongoose
  .connect(DB_CONNECTION_URL)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running and Database connect successfully.`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
