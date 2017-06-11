import * as socketio from "socket.io-client";

export class Client {
    socket: any;
    state: any;

    constructor() {
        let client = this;
        this.socket = socketio();
        this.socket.on('gameState', function(data) {
            client.setState(data['state']);
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

    public join(amount, roomID) {
        console.log("Joining table.");
        this.socket.emit('join', {money: amount, room: 'poker-0'});
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