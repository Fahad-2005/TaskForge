const jwt = require('jsonwebtoken');
const User = require('./models/User');
const { getWorkspaceForUser } = require('./middleware/workspaceAccess');

let io;
// In-memory store for active users per workspace room: { workspaceId: Map(userId -> { userId, name, socketId }) }
const workspacePresence = new Map();



function initializeSocket(httpServer) {
  const rawOrigins = process.env.CLIENT_URL || 'http://localhost:5173';
  const allowedOrigins = rawOrigins.split(',').map((o) => o.trim()).filter(Boolean);
  const { Server } = require('socket.io');

  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins.length === 1 ? allowedOrigins[0] : allowedOrigins,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      credentials: true,
    },
  });

  // JWT Middleware for Socket Handshake
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication failed: Missing token'));

      const payload = jwt.verify(token, process.env.JWT_SECRET || 'secretkey123');
      const user = await User.findById(payload.id).select('_id name email');
      if (!user) return next(new Error('Authentication failed: User not found'));
      
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    // Join private channel for direct notifications
    socket.join(`user:${socket.user._id}`);

    // JOIN WORKSPACE & PRESENCE BROADCAST
    socket.on('workspace:join', async (workspaceId, acknowledge) => {
      const workspace = await getWorkspaceForUser(workspaceId, socket.user._id);
      if (!workspace) {
        if (acknowledge) acknowledge({ ok: false });
        return;
      }

      socket.join(`workspace:${workspaceId}`);
      socket.currentWorkspaceId = workspaceId;

      // Track presence
      if (!workspacePresence.has(workspaceId)) {
        workspacePresence.set(workspaceId, new Map());
      }
      const roomUsers = workspacePresence.get(workspaceId);
      roomUsers.set(socket.user._id.toString(), {
        userId: socket.user._id.toString(),
        name: socket.user.name,
        socketId: socket.id,
      });

      // Broadcast active user list to everyone in this workspace room
      io.to(`workspace:${workspaceId}`).emit(
        'presence:update',
        Array.from(roomUsers.values())
      );

      if (acknowledge) acknowledge({ ok: true });
    });

    // LEAVE WORKSPACE
    socket.on('workspace:leave', (workspaceId) => {
      socket.leave(`workspace:${workspaceId}`);
      cleanUserPresence(socket, workspaceId);
    });

    // DISCONNECT
    socket.on('disconnect', () => {
      if (socket.currentWorkspaceId) {
        cleanUserPresence(socket, socket.currentWorkspaceId);
      }
    });
  });

  return io;
}

// Helper to remove user from room presence map and emit update
function cleanUserPresence(socket, workspaceId) {
  if (workspacePresence.has(workspaceId)) {
    const roomUsers = workspacePresence.get(workspaceId);
    if (socket.user?._id) {
      roomUsers.delete(socket.user._id.toString());
    }

    if (roomUsers.size === 0) {
      workspacePresence.delete(workspaceId);
    } else {
      io.to(`workspace:${workspaceId}`).emit(
        'presence:update',
        Array.from(roomUsers.values())
      );
    }
  }
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

function emitMemberJoined(workspaceId, updatedMembers) {
  if (io && workspaceId) {
    io.to(`workspace:${workspaceId}`).emit('workspace:members_updated', updatedMembers);
  }
}


module.exports = { initializeSocket, emitToWorkspace, emitToUser, emitMemberJoined };