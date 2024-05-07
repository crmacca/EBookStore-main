const express = require('express');
const expressSession = require('express-session');
const passport = require('passport');
const { PrismaClient } = require('@prisma/client');
const { PrismaSessionStore } = require('@quixo3/prisma-session-store');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');
const http = require('http');
const { Server } = require('socket.io');
const sharedsession = require("express-socket.io-session");
const { setupBlackjackGame } = require('./socketCategories/blackjack');
const cors = require('cors');
const { setupTetrisGame } = require('./socketCategories/tetris');
const setupStatic = require('./serveStatic');

require('./auth/passportConfig')(passport); // Passport configuration
require('dotenv').config()

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'https://ebook.cmcdev.net',  // Adjust this to match your front-end URL
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['CSRF-Token']
  }
});

const prisma = new PrismaClient();

const sessionMiddleware = expressSession({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new PrismaSessionStore(
        prisma,
        {
            checkPeriod: 2 * 60 * 1000, // Check expired sessions every 2 minutes
            dbRecordIdIsSessionId: true,
        }
    ),
    cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    }
});

// Configure CORS
const corsOptions = {
  origin: 'https://ebook.cmcdev.net', // Adjust this to match your client URL in production
  methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'],
  allowedHeaders: ['Content-Type', 'CSRF-Token'],
  credentials: true,
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(sessionMiddleware);

// Middleware to enable sessions in Socket.IO
io.use(sharedsession(sessionMiddleware, {
    autoSave:true
}));

app.use(passport.initialize());
app.use(passport.session());

// CSRF protection middleware
const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);

// Add a route to send the CSRF token to the client
app.get('/csrf-token', (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});

// Apply CSRF protection to all POST, PUT, DELETE requests
app.use((req, res, next) => {
    if (/^\/api\//.test(req.originalUrl)) { // Only APIs under '/api/' route prefix
        csrfProtection(req, res, next);
    } else {
        next();
    }
});

// Socket.IO event handling
io.on('connection', (socket) => {
  //console.log('A user connected');
  socket.on('bj-disconnect', () => {
      //console.log('User disconnected');
  });

  // Example event
  socket.on('bj-example-event', (data) => {
      if (socket.handshake.session.passport && socket.handshake.session.passport.user) {
          //console.log(`Received event from authenticated user: ${data}`);
      } else {
          socket.emit('bj-auth_error', 'User is not authenticated');
      }
  });
});

// Define API routes here
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/balance', require('./routes/balanceRoutes'));
app.use('/api/books', require('./routes/bookRoutes'));

setupBlackjackGame(io);
setupTetrisGame(io);

if(process.env.NODE_ENV === 'production') {
    setupStatic(app)
}

module.exports = { app, server };
