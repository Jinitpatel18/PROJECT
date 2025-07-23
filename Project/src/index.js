import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config(
    {
        path: "./.env"
    }
);


// Connect to database and start server
connectDB()
    .then(() => {
        app.listen(process.env.PORT || 3000, () => {
            console.log(`Server is running on port ${process.env.PORT || 3000}`);
        });
    })
    .catch((error) => {
        console.error("Error starting the server:", error);
        process.exit(1);
    });