const Express = require("express")();
const Http = require("http").Server(Express);
const SocketIO = require("socket.io")(Http, {
    cors: {
      origin: "http://10.11.1.7:8080",
      methods: ["GET", "POST"]
    }
  });

let position = {
    x: 200,
    y: 200
};

SocketIO.on("connection", (socket) => {
    socket.emit("position", position);
    socket.on("move", direction => {
        switch (direction) {
            case "right":
                position.x += 5;
                break;
            case "left":
                position.x -= 5;
                break;
            case "up":
                position.y -= 5;
                break;
            case "down":
                position.y += 5;
                break;
        }
        SocketIO.emit("position", position);
    });
});

Http.listen(3000, () => {
    console.log("Listening at :3000...");
});