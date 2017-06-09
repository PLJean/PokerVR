// var socket = require('socket.io-client')();
import * as socketio from "socket.io-client";

// var hand = null;
// var seat = null;
// var players = null;
// var state = null;

export class Client {
    socket: any;
    state: any;

    constructor() {
        let client = this;
        this.socket = socketio();
        this.socket.on('gameState', function(data) {
            // console.log("gameState");
            // players = data['state']['players'];
            client.setState(data['state']);
            // console.log(data);
            // console.log(data['state']['players']['1']);
        });
    }

    public setState(state: any): void {
        this.state = state;
    }
}

export class PokerClient extends Client {
    hand = null;
    seat = null;
    players = null;

    constructor() {
        super();
        let client = this;
        this.socket.on('join failed', function(data) {
            console.log(data.message);
        });

        this.socket.on('hand', function(data) {
            client.setHand(data['hand']);
            // console.log(hand);
        });

        this.socket.on('beSeated', function(data) {
            client.setSeat(data['seatNumber']);
        });
    }

    public setHand(hand) {
        this.hand = hand;
    }

    public setSeat(seat) {
        this.seat = seat;
    }

    public join(amount) {
        console.log("Joining table.");
        this.socket.emit('join', {money: amount});
    }

    public leave() {
        console.log("Leaving table.");
        this.socket.emit('leave');
    }

    public bet(amount) {
        console.log("Bet " + amount);
        this.socket.emit('bet', {money: amount});
    }

    public fold() {
        console.log("Fold");
        this.socket.emit('fold');
    }

    public call() {
        console.log("Call");
        this.socket.emit('call');
    }

    public getHand() {
        if (this.hand == null) return null;

        else {
            var newHand = this.hand;
            this.hand = null;
            return newHand;
        }
    }

    public getSeat() {
            if (this.seat == null) return null;

        else {
            var newSeat = this.seat;
            this.seat = null;
            return newSeat;
        }
    }

    public getPlayers() {
        if (this.players == null) return null;

        else {
            var newPlayers = this.players;
            this.players = null;
            return newPlayers;
        }
}

    public getState() {
        if (this.state == null) return null;

        else {
            var newState = this.state;
            this.players = this.state['players'];
            this.state = null;

            return newState;
        }
    }
}





// socket.on('join failed', function(data) {
//     console.log(data.message);
// });
//
// socket.on('hand', function(data) {
//     hand = data['hand'];
//     // console.log(hand);
// });
//
// socket.on('beSeated', function(data) {
//     seat = data['seatNumber'];
// });
//
// socket.on('gameState', function(data, action) {
//     // console.log("gameState");
//     players = data['state']['players'];
//     state = data['state'];
//     // console.log(data);
//     // console.log(data['state']['players']['1']);
// });
//
// function join(amount, seat) {
//     console.log("Joining table.");
//     socket.emit('join', {money: amount, seatNumber: seat});
// }
//
// function leave() {
//     console.log("Leaving table.");
//     socket.emit('leave');
// }
//
// function handleMoney(amount, minimum) {
//     console.log("Putting in " + amount + " with a minimum of " + minimum);
//     socket.emit('handleMoney', {money: amount, minimum: minimum});
// }
//
// function bet(amount) {
//     console.log("Bet " + amount);
//     socket.emit('bet', {money: amount});
// }
//
// function fold() {
//     console.log("Fold");
//     socket.emit('fold');
// }
//
// function call() {
//     console.log("Call");
//     socket.emit('call');
// }
//
// function getHand() {
//     if (hand == null) return null;
//
//     else {
//         var newHand = hand;
//         hand = null;
//         return newHand;
//     }
// }
//
// function getSeat() {
//     if (seat == null) return null;
//
//     else {
//         var newSeat = seat;
//         seat = null;
//         return newSeat;
//     }
// }
//
// function getPlayers() {
//     if (players == null) return null;
//
//     else {
//         var newPlayers = players;
//         players = null;
//         return newPlayers;
//     }
// }
//
// function getState() {
//     if (state == null) return null;
//
//     else {
//         var newState = state;
//         state = null;
//         return newState;
//     }
// }
//
//
// module.exports = {
//     join,
//     leave,
//     bet,
//     call,
//     fold,
//     getState,
//     getHand,
//     getSeat,
//     getPlayers
// };