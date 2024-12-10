const https = require("https");
const fs = require("fs");
const WebSocket = require("ws");

const certFile = fs.readFileSync(
  "/etc/letsencrypt/live/aspirewithalina.com/fullchain.pem"
);
const keyFile = fs.readFileSync(
  "/etc/letsencrypt/live/aspirewithalina.com/privkey.pem"
);

const server = https.createServer({
  cert: certFile,
  key: keyFile,
});

const wss = new WebSocket.Server({
  server,
  path: "/chat",
  verifyClient: (info) => {
    console.log("Client origin: ", info.origin); // TODO: Add more verification logic
    return true;
  },
});

const chatGroups = {};

wss.on("connection", (ws, req) => {});

server.listen(11112, () => {
  console.log(
    "WebSocket server started securely on https://localhost:11112/chat"
  );
});
