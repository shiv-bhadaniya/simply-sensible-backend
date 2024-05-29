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
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Set-Cookie"],
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", process.env.FRONTEND_HOST);
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});
// app.use(function (req, res, next) {
//   // Website you wish to allow to connect
//   res.setHeader("Access-Control-Allow-Origin", [
//     process.env.FRONTEND_HOST,
//     "http://localhost:3000",
//   ]);
//   // Request methods you wish to allow
//   res.setHeader(
//     "Access-Control-Allow-Methods",
//     "GET, POST, OPTIONS, PUT, PATCH, DELETE"
//   );
//   // Request headers you wish to allow
//   res.setHeader(
//     "Access-Control-Allow-Headers",
//     "Origin,X-Requested-With,content-type,set-cookie"
//   );
//   // Set to true if you need the website to include cookies in the requests sent
//   // to the API (e.g. in case you use sessions)
//   res.setHeader("Access-Control-Allow-Credentials", true);

//   // Pass to next layer of middleware
//   next();
// });
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
