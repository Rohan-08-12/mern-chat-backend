const socketIo=(io)=>{
    // Store connected users with their room info using socket id as the key
    const connectedUsers = new Map();
    // Handle new  socket connection
    io.on("connection", (socket) => {
        // Get user from authentication
        // handshake ->in-build function of socket that connect other properties
        const user=socket.handshake.auth.user;
        console.log('User connected',user?.username);
        // !START  : Join room Handler
        socket.on("join room",(groupId)=>{
            // Add socket to the specific room
            socket.join(groupId);
            // Store user and  room info in connectedUsers Map
            connectedUsers.set(socket.id,{user,room:groupId});
            // Get list of all the users currently in the room
            const usersInRoom=Array.from(connectedUsers.values()).filter((u)=>u.room===groupId).map((u)=>u.user);
            // Emit event to all users in the room
            io.in(groupId).emit("users in room",usersInRoom);
            // Broadcast join notification to all other users in the room
            socket.to(groupId).emit("notification",{
                type:"USER_JOINED",
                message:`${user?.username} joined the room`,
                user:user
            });
        })
        // !END    : Join room Handler

        // !START  : Leave room Handler
        // Trigger when user manually leaves the room
        socket.on("leave room",async(groupId)=>{
            console.log(`${user?.username} left the room`,groupId);
            // Remove socket from the room
            socket.leave(groupId);
            if(connectedUsers.has(socket.id)){
                // Remove user and room info from connectedUsers Map
                connectedUsers.delete(socket.id);
                socket.to(groupId).emit("user left",user?._id);
            }
        })
        // !END    : Leave room Handler

        // !START  : New  message Handler
        socket.on("new message",async(message)=>{
            // Broadcast message to all the other users in the room
            socket.to(message.groupId).emit("message received",message);
        })
        // !END    : New  message Handler

        // !START  : Disconnect Handler
        // Trigger when user closes the connection
        socket.on("disconnect",async()=>{
            console.log(`${user?.username} disconnected`);
            if(connectedUsers.has(socket.id)){
                // Get user's room info before removing
                const userData=connectedUsers.get(socket.id);
                // Notify others in the room about user leaving
                socket.to(userData.room).emit("user left",user?._id);
                // Remove user and room info from connectedUsers Map
                connectedUsers.delete(socket.id);
            }
        })
        // !END    : Disconnect Handler

        // !START  : Typing Indicator
        // Trigger when user starts typing
        socket.on("typing",async({groupId,username})=>{
            // Broadcast typing indicator to all users in the room
            socket.to(groupId).emit("user typing",{username});
        })
        // Trigger when user stop typing
        socket.on("typing",async({groupId})=>{
            // Broadcast typing indicator to all users in the room
            socket.to(groupId).emit("user stop typing",{username:user?.username});
        })
        // !END    : Typing Indicator


        
    })
};

module.exports = socketIo;