import mongoose from "mongoose";
import serverConfig from "./serverConfig.js";

export function connectDB() {
    try {
        mongoose.connect(serverConfig.MONGO_URI);
        console.log("Successfully connected to DB");
    } catch (error) {
        console.log(error)
        console.log("Failed to connect to DB");
    }
}