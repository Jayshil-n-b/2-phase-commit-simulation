const registerInterfaceHandler = (
  io,
  socket,
  coordinateMap,
  startedMap,
  countMap
) => {
  const loadUser = async (roomId) => {
    if (startedMap.has(roomId)) {
      io.to(socket.id).emit("info:already-started");
      return;
    }
    socket.join(roomId);
    if (io.sockets.adapter.rooms.get(roomId).size === 1) {
      coordinateMap.set(roomId, socket);
      io.to(socket.id).emit("load:user", "coordinator");
    } else {
      io.to(socket.id).emit("load:user", "participant");
    }
  };
  const loadPolling = async (roomId) => {
    startedMap.set(roomId, true);
    socket.broadcast.to(roomId).emit("load:polling");
  };
  const voteCommit = async (roomId) => {
    io.to(coordinateMap.get(roomId).id).emit("vote:commit");
    let prevCount = countMap.get(roomId);
    countMap.set(roomId, prevCount - 1);
    if (prevCount - 1 === 0) commitProcess(roomId);
  };
  const voteAbort = async (roomId) => {
    io.to(coordinateMap.get(roomId).id).emit("vote:abort");
  };
  const clientCount = async (roomId) => {
    io.to(coordinateMap.get(roomId).id).emit(
      "vote:client-count",
      io.sockets.adapter.rooms.get(roomId).size - 1
    );
    countMap.set(roomId, io.sockets.adapter.rooms.get(roomId).size - 1);
  };
  const abortProcess = async (roomId) => {
    countMap.delete(roomId);
    coordinateMap.delete(roomId);
    startedMap.delete(roomId);
    socket.broadcast.to(roomId).emit("decision:abort");
    socket.broadcast.to(roomId).emit("decision:abort");
  };
  const commitProcess = async (roomId) => {
    countMap.delete(roomId);
    coordinateMap.delete(roomId);
    startedMap.delete(roomId);
    socket.broadcast.to(roomId).emit("decision:commit");
    io.to(socket.id).emit("decision:commit");
  };

  socket.on("load:user", loadUser);
  socket.on("load:polling", loadPolling);
  socket.on("vote:abort", voteAbort);
  socket.on("vote:commit", voteCommit);
  socket.on("vote:client-count", clientCount);
  socket.on("decision:abort", abortProcess);
};

module.exports = registerInterfaceHandler;
