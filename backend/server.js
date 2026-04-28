import express from "express";
import dotenv from "dotenv";
import chalk from "chalk";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import mongoSanitize from "@exortek/express-mongo-sanitize";

import helmet from "helmet";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import collectionRoutes from "./routes/collectionRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";

dotenv.config();
connectDB();

const app = express();

// Security Middlewares
app.use(helmet());

app.use(mongoSanitize());

//  General Middlewares
app.use(morgan("dev"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//
app.use("/uploads", express.static("uploads"));

//
app.get("/", (req, res) => {
  res.json({
    message: "EveryWear - All in one clothing store !!",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/collections", collectionRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);

//  Global Error Handler
app.use((err, req, res, next) => {
  console.error(chalk.red(`Error: ${err.message}`));

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    errors: err.errors || null,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(chalk.blue(`Server is walking on http://localhost:${PORT}`));
});
