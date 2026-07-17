const jwt = require('jsonwebtoken');
const User = require('./models/User');
const { getWorkspaceForUser } = require('./middleware/workspaceAccess');

let io;

function initializeSocket(httpServer) {
  const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
  const { Server } = require('socket.io');

  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigin,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'secretkey123');
      const user = await User.findById(payload.id).select('_id name email');
      if (!user) return next(new Error('Authentication failed'));
      socket.user = user;
      next();
    } catch {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(`user:${socket.user._id}`);

    socket.on('workspace:join', async (workspaceId, acknowledge) => {
      const workspace = await getWorkspaceForUser(workspaceId, socket.user._id);
      if (!workspace) {
        if (acknowledge) acknowledge({ ok: false });
        return;
      }
      socket.join(`workspace:${workspaceId}`);
      if (acknowledge) acknowledge({ ok: true });
    });

    socket.on('workspace:leave', (workspaceId) => {
      socket.leave(`workspace:${workspaceId}`);
    });
  });

  return io;
}

function emitToWorkspace(workspaceId, event, payload) {
  if (io && workspaceId) {
    io.to(`workspace:${workspaceId}`).emit(event, payload);
  }
}

function emitToUser(userId, event, payload) {
  if (io && userId) {
    io.to(`user:${userId}`).emit(event, payload);
  }
}

module.exports = { initializeSocket, emitToWorkspace, emitToUser };
