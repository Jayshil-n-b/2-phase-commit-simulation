import { io } from "socket.io-client";

const URL = "http://localhost:5501";

export const socket = io(URL);
