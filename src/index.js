import express from "express";
import serverConfig from "./config/serverConfig.js";
import { connectDB } from "./config/dbConfig.js";
import userRouter from "./routes/userRoutes.js";

const app = express();

app.use(express.json());

app.get("/hi", (req, res) => {
    res.send("hello")
})

app.use("/users", userRouter);

app.listen(serverConfig.PORT, () => {
    connectDB();
    console.log(`Server is running on port ${serverConfig.PORT}`);
});