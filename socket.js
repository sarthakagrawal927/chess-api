const { Server } = require("socket.io");
const logger = require("./logger.js");

let io;
let connectedUserCount = 0;

// const leaveAllRooms = (socket, current) => {
//   const rooms = socket.rooms.values();

//   for (let val = rooms.next().value; val; val = rooms.next().value) {
//     if (val !== current) {
//       socket.leave(val);
//     }
//   }
// };

if(io){
  io.on("connection", (socket) => {
    connectedUserCount += 1;
    logger.info({ connectedUserCount }, "New user connected");

    socket.on("joinRoom", (args) => {
      socket.join(args.roomId);
      // leaveAllRooms(socket, args)
    });

    socket.on("leaveRoom", (args) => {
      socket.leave(args.roomId);
    });

    socket.on("disconnect", () => {
      connectedUserCount -= 1;
      logger.info({ connectedUserCount }, "User disconnected");
    });
  });
}


const sendToSocket = (data) => {
  io.local.emit("data", data);
}


function initializeSocket(server){
   io = new Server(server)
}

module.exports = {initializeSocket, sendToSocket};