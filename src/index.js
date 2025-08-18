import express from "express";
import serverConfig from "./config/serverConfig.js";
import { connectDB } from "./config/dbConfig.js";
import userRouter from "./routes/userRoutes.js";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";
import createTaskRouter from "./routes/taskRoutes.js";
import createActionRouter from "./routes/actionRoutes.js";
import createcommentRouter from "./routes/commentRoutes.js";
import createAttachmentRouter from "./routes/attatchmentRoutes.js";
import createSubTaskRouter from "./routes/subtasksRoutes.js";

const app = express();
const server = http.createServer(app);

// Setup socke.io
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});

//store io in app locals to access from controllers/serverces
app.set('io', io);

app.use(express.json());
app.use(cookieParser());

app.get("/hi", (req, res) => {
    res.send("hello")
})

app.use("/users", userRouter);
app.use("/tasks", createTaskRouter(io));
app.use("/actions", createActionRouter(io));
app.use("/comments", createcommentRouter(io))
app.use("/attatchments", createAttachmentRouter(io))
app.use("/tasks", createSubTaskRouter(io));

server.listen(serverConfig.PORT, () => {
    connectDB();
    console.log(`Server is running on port ${serverConfig.PORT}`);
});