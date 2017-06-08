var socket = require('socket.io-client')();
var hand = null;
var seat = null;
var players = null;
var state = null;

socket.on('join failed', function(data) {
    console.log(data.message);
});

socket.on('hand', function(data) {
    hand = data['hand'];
    // console.log(hand);
});

socket.on('beSeated', function(data) {
    seat = data['seatNumber'];
});

socket.on('gameState', function(data, action) {
    // console.log("gameState");
    players = data['state']['players'];
    state = data['state'];
    // console.log(data);
    // console.log(data['state']['players']['1']);
});

function join(amount, seat) {
    console.log("Joining table.");
    socket.emit('join', {money: amount, seatNumber: seat});
}

function leave() {
    console.log("Leaving table.");
    socket.emit('leave');
}

function handleMoney(amount, minimum) {
    console.log("Putting in " + amount + " with a minimum of " + minimum);
    socket.emit('handleMoney', {money: amount, minimum: minimum});
}

function bet(amount) {
    console.log("Bet " + amount);
    socket.emit('bet', {money: amount});
}

function fold() {
    console.log("Fold");
    socket.emit('fold');
}

function call() {
    console.log("Call");
    socket.emit('call');
}

function getHand() {
    if (hand == null) return null;

    else {
        var newHand = hand;
        hand = null;
        return newHand;
    }
}

function getSeat() {
    if (seat == null) return null;

    else {
        var newSeat = seat;
        seat = null;
        return newSeat;
    }
}

function getPlayers() {
    if (players == null) return null;

    else {
        var newPlayers = players;
        players = null;
        return newPlayers;
    }
}

function getState() {
    if (state == null) return null;

    else {
        var newState = state;
        state = null;
        return newState;
    }
}


module.exports = {
    join,
    leave,
    bet,
    call,
    fold,
    getState,
    getHand,
    getSeat,
    getPlayers
};