var Express = require("express")();
var Http = require("http").Server(Express);
var SocketIO = require("socket.io")(Http, {
    cors: {
        origin: "http://10.11.1.7:8080",
        methods: ["GET", "POST"]
    }
});
var position = {
    x: 200,
    y: 200
};
SocketIO.on("connection", function (socket) {
    socket.emit("position", position);
    socket.on("move", function (direction) {
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
Http.listen(3000, function () {
    console.log("Listening at :3000...");
});
