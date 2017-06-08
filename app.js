let express = require('express');
let app = express();
let server = require('http').Server(app);
let io = require('socket.io')(server);

let pokerApp = require(__dirname + '/public/js/poker.js');
app.use(express.static('public/'));

app.get('/', function(req, res) {
    res.sendFile('game.html', {'root': __dirname + '/public'});
});

let poker = new pokerApp.Poker;
// let handRank = new pokerApp.HandRank;

io.on('connection', function(socket) {
    console.log('Player ' +socket.id + ' entered the room.');

    socket.on('disconnect', function() {
        console.log('Player ' + socket.id + ' has left the room.');
        poker.removePlayer(poker.getPlayerByData('socketid', socket.id));
    });

    socket.on('join', function(joinData, seat) {
        console.log("Player attempting to join...");
        // TODO Check database to see if player has money.
        let availableSeat = poker.getSeat(seat);

        if (availableSeat > -1) {
            let data = {
                socketid: socket.id,
                money: joinData.money
            };
            if (poker.addPlayer(availableSeat, data)) {
                console.log("Player joined table. ");
                socket.emit('beSeated', {seatNumber: availableSeat})

            } else {
                console.log("Player join table failed.");
                socket.emit('join failed', {message: 'Join failed. Room is full.'});
            }
        } else {
            socket.emit('join failed', {message: 'Table is full'});
        }
    });

    socket.on('leave', function () {
        poker.removePlayer(poker.getPlayerByData('socketid', socket.id));
    });

    socket.on('fold', function () {
        let player = poker.getPlayerByData('socketid', socket.id);
        if (player && poker.playerFold(player)) {
            console.log("Player " + socket.id + " has folded");
        } else {
            console.log("Player " + socket.id + " tried to fold, but the command failed.");
        }

        // poker.dealer();
    });

    socket.on('bet', function(money) {
        if (!money) {
            console.log("Player " + socket.id + " tried to bet, but amount was null.");
        }

        money = money.money;


        let player = poker.getPlayerByData('socketid', socket.id);
        console.log("/////////////////////");
        if (poker.playerBet(player, money)) {
            console.log("Player " + socket.id + " placed a " + parseInt(money) + " bet.");
        } else {
            console.log("Player " + socket.id + " tried to bet, but the command failed.");
        }
        console.log("/////////////////////");

        // poker.dealer();
    });

    socket.on('call', function() {
        let player = poker.getPlayerByData('socketid', socket.id);
        if (poker.playerCall(player)) {
            console.log("Player " + socket.id + " has called");
        } else {
            console.log("Player " + socket.id + " tried to call, but the command failed.");
        }
    });
});

function newPokerRoom() {

}

function sendHands() {
    for (let i = 0; i < poker.players.length; i++) {
        sendHand(poker.players[i]);
    }

    handSent = true;
}

function sendHand(player) {
    if (player != null) {
        let id = player.get('socketid');
        io.to(id).emit('hand', {hand: player.hand.getCardsArray()});
        console.log("Hand (" + player.hand.getCardsArray().toString() + ") sent to player " + id);
    }
}

function sendGameStates(player) {
    let state = poker.getTableState();
    // console.log(poker.stateChanged);
    for (let i = 0; i < poker.players.length; i++) {
        let player = poker.players[i];
        if (player != null) {
            let id = player.get('socketid');
            io.to(id).emit('gameState', {state: state});
        }
    }
    console.log(poker.stateChanged);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let loops = 0;
let oldStage = -1;
let handSent = false;
let stateSent = false;

let play = function() {
    setImmediate(playLoop);
};

function playLoop() {
    // console.log(poker.inPlay());
    if (poker.inPlay()) {

        if (oldStage != poker.stage) {
            // console.log("Game has moved to stage " + poker.stage + " from stage " + oldStage);
            oldStage = poker.stage;

            // console.log(poker.stage);
            if (poker.stage == 0) {
                handSent = false;
            } else if (poker.stage == 1) {
                if (!handSent) {
                    // console.log("in");
                    sendHands();
                    handSent = true;
                }
            } else if (poker.stage == 2) {

            } else if (poker.stage == 3) {

            } else if (poker.stage == 4) {

            } else if (poker.stage == 5) {

            }

        }
        // console.log(poker.hasNewState());
        poker.dealer();
        // console.log(poker.hasNewState());

        loops += 1;
        // console.log(poker.hasNewState());
        if (poker.hasNewState()) {
            sendGameStates();
        }
    }

    play();
}

server.listen(3000, function () {
    console.log('Listening on *:3000');
    play();
});


consoleInit();

function consoleInit() {
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
}

function quit() {
    console.log('Quitting current poker instance.');
    process.exit();
}

process.stdin.on('data', function (text) {
    text = text.trim();
    try {
        console.log(eval(text));
    } catch (e) {
        console.log(e);
    }
});

