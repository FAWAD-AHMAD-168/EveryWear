import express from "express";
import dotenv from "dotenv";
import chalk from "chalk";
import cors from "cors";
import morgan from "morgan";
import upload from "./middlewares/multer.js";
import connectDB from "./config/db.js";

import { registerUser } from "./controllers/authController.js";
import { uploadFile } from "./controllers/uploadController.js";


dotenv.config();
const app = express();
connectDB();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));



app.get("/", (req, res) => {
  res.json({
    message: "EveryWear - All in one clothing store !!",
  });
});

app.post("/register", registerUser);

app.post("/upload", upload.single("image"), uploadFile);


// Global error handling middleware
app.use((err, req, res, next) => {
  console.error(chalk.red(`Error: ${err.message}`));
  res.status(err.statusCode || 500).json({
    success: err.success || false,
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(chalk.blue(`Server is walking on port ${PORT}`));
});
