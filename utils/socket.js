let io;

module.exports = {
  setIO: (server, options = {}) => {
    io = require("socket.io")(server, options);
    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error("Socket.io not initialized!");
    }
    return io;
  },
};
