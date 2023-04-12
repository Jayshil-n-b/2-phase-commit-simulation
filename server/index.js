// Create express application.
const express = require("express");
const app = express();

// Setup Socket-IO server.
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Realtime Socket-IO methods.
const registerInterfaceHandler = require("./eventHandlers/interfaceHandler");
const coordinateMap = new Map();
const startedMap = new Map();
const countMap = new Map();

const onConnection = (socket) => {
  registerInterfaceHandler(io, socket, coordinateMap, startedMap, countMap);
};

io.on("connection", onConnection);

// Set up router.
const cors = require("cors");
app.use(express.json(), cors());

// Base Path.
app.get("/", (req, res) => {
  res.status(200).send("Backend is up and running...");
});

// Make available the server over defined port.
const PORT = process.env.PORT || 5501;
server.listen(PORT, () => {
  console.log("listening on *:5501");
});
