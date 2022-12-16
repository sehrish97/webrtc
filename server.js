const express = require("express");
const app = express();
const http=require("http");
const server = http.createServer(app);
const socket =require("socket.io");
const io =socket(server);


const users = {};
const socketToRoom = {};
const port = 3001;
app.get("/",(req,res)=>{
    res.send("hello world")
});
app.get("/",(req,res)=>{
    res.send("hello world")
});
server.listen(port, ()=>{
    console.log(`Meeting is on port ${port}`);
});

io.on("connection", socket=>{
    console.log(socket.id);
    socket.emit('connection-success',{
        status: 'connection-success',
        socketId:socket.id,
    })
    socket.on("disconnect", ()=>{
        console.log(`${socket.id} has disconnected`);
    })
    socket.on("sdp",data=>{
        console.log(data)
        socket.broadcast.emit('sdp',data)
    })

    socket.on('candidate', data =>{
        console.log(data);
        socket.broadcast.emit('candidate',data)
    })
})