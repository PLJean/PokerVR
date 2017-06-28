import * as socketio from "socket.io-client";

export class Client {
    socket: any;
    state = {};
    stateChanged = false;
    stateChanges = [];
    players = null;
    ons = {};
    id = 0;

    constructor() {
        let self = this;
        this.socket = socketio();
        this.socket.on('newState', function(data) {
            // self.setState(data['state']);
        });

        this.socket.on('updateState', function(data) {
            console.log("Updating State....");
            // TODO Make stateChanges a Set so there is no overlap when processingStateChanges
            self.id = data.id;
            self.stateChanges = self.stateChanges.concat(data.changes);
            self.updateStates(data.changes);
            console.log(data.changes);
        });
    }

    public setState(state: any): void {
        this.state = state;
    }

    public updateStates(changes) {
        for (let i = 0; i < changes.length;  i++) {
            this.updateState(changes[i][0], changes[i][1]);
        }
    }

    public updateState(key, value) {
        if (!key) return;

        // console.log("key: " + key);
        // console.log(value);

        let keys = key.split('.');
        if (keys.length != 0) {
            let object = this.state;
            for (let i = 0; i < keys.length; i++) {
                // console.log(object);
                if (i == keys.length - 1) {
                    object[keys[i]] = value;
                }

                else if (object[keys[i]] == null) {
                    object[keys[i]] = {};
                }

                object = object[keys[i]];
            }
        }
        // console.log("\n");

        this.stateChanged = true;
        // console.log(this.stateChanges);
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

    public on(stateChange, fn) {
        this.ons[stateChange] = fn;
    }

    public emit(stateChange) {

    }

    public processStateChanges() {
        for (let i = 0; i < this.stateChanges.length; i++) {
            let change = this.stateChanges[i][0];
            // console.log('--------------------');
            // console.log('change: ' + change);
            let onsList = Object.keys(this.ons);

            for (let j = 0; j < onsList.length; j++) {
                // console.log(onsList[j]);
                let patt = new RegExp('^' + onsList[j] + '$');
                // console.log(patt);
                let res = patt.exec(change);
                if (res) {
                    // console.log("hit");
                    this.ons[onsList[j]]();
                    break;
                }
            }
            // console.log('--------------------\n');
            // if (change in this.ons) {
            //     // console.log("in");
            //     this.ons[change]();
            // }
        }

        this.stateChanges = [];
    }

    public hasChanged() {
        return this.stateChanges.length > 0;
    }
}

export class PokerClient extends Client {
    hand = null;
    seat = null;
    rooms = null;

    constructor() {
        super();
        let client = this;
        this.socket.on('join failed', function(data) {
            // console.log(data.message);
        });

        this.socket.on('hand', function(data) {
            client.setHand(data['hand']);
            // console.log(hand);
        });

        this.socket.on('beSeated', function(data) {
            let seatNumber = data['seatNumber'];
            client.setSeat(seatNumber);
            // client.setBetMin((data['players'][seatNumber]['minimumBet'])
        });

        this.socket.on('rooms', function(data) {
            // console.log("rooms: ");
            // console.log(data['rooms']);
            client.setRooms(data['rooms']);
        });
    }

    public requestRooms() {
        console.log("requesting rooms...");
        this.socket.emit('needRooms');
    }

    public setHand(hand) {
        this.hand = hand;
    }

    public setSeat(seat) {
        this.seat = seat;
    }

    public setRooms(rooms) {
        this.rooms = rooms;
    }

    public join(amount, roomID) {
        console.log("Joining table.");
        this.socket.emit('join', {money: amount, room: roomID});
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

    public getBetRange() {

    }

    public getRooms() {
        if (this.rooms == null) return null;

        else {
            var newRooms = this.rooms;
            this.rooms = null;
            return newRooms;
        }
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
}
