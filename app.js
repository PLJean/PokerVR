function consoleInit() {
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', function (text) {
        text = text.trim();
        try {
            console.log(eval(text));
        } catch (e) {
            console.log(e);
        }
    });
}

function quit() {
    console.log('Quitting current poker instance.');
    process.exit();
}

let express = require('express');
let app = express();
let server = require('http').Server(app);
let gameServer = new (require(__dirname + '/app/server/server.js')).GameServer(server);
let game = function(type, index) {
    return gameServer.rooms[type + '-' + index].game;
};

let gameSkip = function(game) {
    while (game.stage != 4) {
        for (let i = 0; i < game.players.length; i++) {
            if (game.players[i]){
                game.players[i].call();
            }
        }
        game.dealer();
    }
};

app.use(express.static('public/'));
app.use('app/', express.static('/app/clients/client.js'));

app.get('/pokerVR', function(req, res) {
    res.sendFile('game.html', {'root': __dirname + '/public'});
});

gameServer.listen(80, function () {
    console.log("Listening at :80")
});

consoleInit();



