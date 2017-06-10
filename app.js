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
let gameServer = new (require(__dirname + '/app/poker.js')).GameServer(server);

app.use(express.static('public/'));
app.use('app/', express.static('/app/client.js'));

app.get('/', function(req, res) {
    res.sendFile('game.html', {'root': __dirname + '/public'});
});

gameServer.listen(3000, function () {
    console.log("Listening at :3000")
});

consoleInit();



