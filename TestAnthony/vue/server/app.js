var Express = require("express")();
var Http = require("http").Server(Express);
var SocketIO = require("socket.io")(Http, {
    cors: {
        origin: "http://10.11.1.3:8080",
        methods: ["GET", "POST"]
    }
});

var position = {
    x: 200,
    y: 200
};

SocketIO.on("connection", function (socket) {
    socket.emit("position", position);
    socket.on("sendCode", function(codeReturned) {
        const params = {
            grant_type: "authorization_code",
            client_id: "u-s4t2ud-087efa7b62c41e99d1e37bc854a53a4b582043c7c148982838b9c853137e8db7",
            client_secret: "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",
            code: codeReturned,
            redirect_uri: "http://10.11.1.3:8080/"
        }
        const options = {
            method: "POST",
            body: JSON.stringify(params)
        }
        const response = fetch("https://api.intra.42.fr/oauth/token", options)
        .then(response => console.log(response.json()))
    });
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
