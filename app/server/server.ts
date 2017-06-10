import {Poker} from "../game/poker";
import * as socketIo from "socket.io";

export class GameServer {
    private io: any;
    private port: 3000;
    private server;
    oldStage = -1;
    handSent = false;

    rooms = {

    };

    idMap = {

    };

    constructor(server) {
        this.server = server;
        // this.roomMap['lobby'] =
        let gameServer = this;
        this.createRoom('lobby');
        this.createRoom('poker-0', new Poker());
        this.createRoom('poker-1', new Poker());
    }

    public listen(port, fn) {
        this.io = socketIo(this.server);
        this.initIO();
        this.server.listen(port, fn);
        this.run();

    }

    public getRooms(includePlayer): object {
        let rooms = this.rooms;
        if (includePlayer) {

        }

        return this.rooms;
    }

    public getRoom(name) {
        return this.rooms[name];
    }

    public createRoom(name, game = null) {
        if (name == 'lobby') {
            this.rooms[name] = {};
        } else {
            this.rooms[name] = {game: game};
        }
    }

    initIO () {
        var server = this;
        var socketRoom = function(socket) {
            let keys = Object.keys(socket.rooms);
            return socket.rooms[keys[1]];
        };

        this.io.on('connection', function(socket) {
            console.log('Player ' + socket.id + ' entered the room.');

            socket.join('lobby');

            socket.emit('rooms',  {rooms: server.getRooms(false)});

            socket.on('disconnecting', function() {
                console.log('Player ' + socket.id + ' has left the room.');
                console.log(socket);
                let room = server.getRoom(socketRoom(socket));
                if (room && room.hasOwnProperty('game'))
                    room.game.removePlayer(room.game.getPlayerByData('socketid', socket.id));
            });

            socket.on('join', function(data) {
                console.log("Player attempting to join...");
                socket.leave('lobby');
                socket.join(data.room);
                let room = server.getRoom(data.room);
                // TODO Check database to see if player has money.
                let availableSeat = room.game.getSeat();

                if (availableSeat > -1) {
                    let playerData = {
                        socketid: socket.id,
                        money: data.money
                    };
                    if (room.game.addPlayer(availableSeat, playerData)) {
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
                let room = server.getRoom(socket.rooms[1]);
                room.game.removePlayer(room.game.getPlayerByData('socketid', socket.id));
            });

            socket.on('fold', function () {
                let room = server.getRoom(socketRoom(socket));
                let player = room.game.getPlayerByData('socketid', socket.id);
                if (player && room.game.playerFold(player)) {
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

                let room = server.getRoom(socketRoom(socket));

                let player = room.game.getPlayerByData('socketid', socket.id);
                console.log("/////////////////////");
                if (room.game.playerBet(player, money)) {
                    console.log("Player " + socket.id + " placed a " + parseInt(money) + " bet.");
                } else {
                    console.log("Player " + socket.id + " tried to bet, but the command failed.");
                }
                console.log("/////////////////////");

                // poker.dealer();
            });

            socket.on('call', function() {
                let room = server.getRoom(socketRoom(socket));

                let player = room.game.getPlayerByData('socketid', socket.id);
                if (room.game.playerCall(player)) {
                    console.log("Player " + socket.id + " has called");
                } else {
                    console.log("Player " + socket.id + " tried to call, but the command failed.");
                }
            });

            socket.on('action', function() {

            })
        });
    }

    private run() {
        let server = this;
        let rooms = this.rooms;

        var loop = function () {
            let roomKeys = Object.keys(rooms);
            for (let roomID in rooms) {
                // console.log("\n");
                // console.log(room);
                // console.log(room.game);
                if (roomID != 'lobby' && rooms[roomID] && rooms[roomID].game.inPlay()) {
                    let room = rooms[roomID];
                    if (server.oldStage != room.game.stage) {
                        server.oldStage = room.game.stage;

                        if (room.game.stage == 0) {
                            server.handSent = false;
                        } else if (room.game.stage == 1) {
                            if (!server.handSent) {
                                server.sendHands(room);
                                server.handSent = true;
                            }
                        } else if (room.game.stage == 2) {

                        } else if (room.game.stage == 3) {

                        } else if (room.game.stage == 4) {

                        } else if (room.game.stage == 5) {

                        }

                    }
                    room.game.dealer();

                    if (room.game.hasNewState()) {
                        server.sendGameStates(room);
                    }
                }
            }

            again();
        };

        var again = function() {
            setImmediate(loop, rooms);
        };

        loop();
    }

    private sendHands(room) {
        for (let i = 0; i < room.game.players.length; i++) {
            this.sendHand(room.game.players[i]);
        }

        this.handSent = true;
    }

    private sendHand(player) {
        if (player != null) {
            let id = player.get('socketid');
            this.io.to(id).emit('hand', {hand: player.hand.getCardsArray()});
            console.log("Hand (" + player.hand.getCardsArray().toString() + ") sent to player " + id);
        }
    }

    private sendGameStates(room) {
        let state = room.game.getState();
        // console.log(poker.stateChanged);
        for (let i = 0; i < room.game.players.length; i++) {
            let player = room.game.players[i];
            if (player != null) {
                let id = player.get('socketid');
                this.io.to(id).emit('gameState', {state: state});
            }
        }
        console.log(room.game.stateChanged);
    }
}