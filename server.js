const express = require("express");
const dotenv=require("dotenv");
const mongoose=require("mongoose");
const cors=require("cors");
const http=require("http");
const userRouter = require("./routes/userRoutes");
const groupRouter = require("./routes/groupRoutes");
const messageRouter = require("./routes/messageRoutes");
const socketio=require("socket.io");
const socketIo=require("./socket");
dotenv.config();

const app=express();
const server=http.createServer(app);
const io=socketio(server,{
    cors:{
        origin:['https://merniochat.netlify.app'],
        methods:["GET","POST"],
        credentials:true,
    }
});

// middlewares
app.use(cors());
app.use(express.json());

// connect to db
mongoose.connect(process.env.MONGO_URL).then(()=>{
    console.log("Connected to DB");
}).catch((err)=>{
    console.log(err.message);
});


// Initialize Socket.io
socketIo(io);

// routes
app.use("/api/users",userRouter);
app.use("/api/groups",groupRouter);
app.use("/api/messages",messageRouter);


// start server
const PORT=process.env.PORT || 5000;

server.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`);
});