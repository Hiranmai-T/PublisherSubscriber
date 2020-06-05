const WebSocketServer = require("ws").Server;
const express = require("express");
const path = require("path");
const server = require("http").createServer();
const PubSubManager = require("./pubsub2");
//const mysql = require("mysql");
const app = express();

const pubSubManager = new PubSubManager();
app.use(express.static(path.join(__dirname, "/public")));
const wss = new WebSocketServer({ server: server });
wss.on("connection", (ws, req) => {
  console.log(`Connection request from: ${req.connection.remoteAddress}`);
  ws.on("message", (data) => {
    console.log("data: " + data);
    const json = JSON.parse(data);
    const id = json.id;
    const request = json.request;
    const message = json.message;
    const channel = json.channel;

    switch (request) {
      case "PUBLISH":
        pubSubManager.publish(id, ws, channel, message);
        break;
      case "SUBSCRIBE":
        pubSubManager.subscribe(id, ws, channel);
        break;
    }
  });
  ws.on("close", () => {
    console.log("Stopping client connection.");
  });
});

server.on("request", app);
server.listen(3000, () => {
  console.log("Server listening on http://localhost:3000");
});
