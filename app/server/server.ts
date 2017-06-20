import {Poker} from "../game/poker";
import * as socketIo from "socket.io";

export class GameServer {
    private io: any;
    private port: 3000;
    private server;
    oldStage = -1;
    handSent = false;
    pausedRooms = {};
    sitters = {};
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
        this.createRoom('poker-1', new Poker({type: 'Pot Limit'}));
        this.createRoom('poker-2', new Poker());
        this.createRoom('poker-3', new Poker({type: 'Fixed Limit'}));
        this.createRoom('poker-4', new Poker({type: 'Pot Limit'}));
    }

    public listen(port, fn) {
        this.io = socketIo(this.server);
        this.initIO();
        this.server.listen(port, fn);
        this.run();

    }

    public getRooms(includePlayer): object {
        let rooms = Object.keys(this.rooms);
        let returnData = {};
        for (let room in this.rooms) {
            if (room != 'lobby') {
                // console.log(this.rooms[room]);
                let game = this.rooms[room].game;
                // console.log("playerCount: " + game.getConfig('playerCount'));
                returnData[room] = {
                    game: 'Poker',
                    type: game.getConfig('type'),
                    minimum: game.getConfig('minimum'),
                    maximum: game.getConfig('maximum'),
                    playerCount: game.playerCount,
                    maxPlayerCount: game.getConfig('maxPlayers')
                };
            }
        }

        if (includePlayer) {

        }

        return returnData;
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
            // console.log("socketRoom(): ");
            // console.log(socket.rooms);
            // console.log(keys);
            return socket.rooms[keys[1]];
        };

        this.io.on('connection', function(socket) {
            console.log('Player ' + socket.id + ' entered the room.');

            socket.join('lobby');

            socket.on('needRooms', function () {
                console.log("Sending rooms.");
                socket.emit('rooms',  {rooms: server.getRooms(false)});
            });

            socket.on('disconnecting', function() {
                console.log('Player ' + socket.id + ' has left the room.');
                delete server.idMap[socket.id];
                // console.log(socket);
                let room = server.getRoom(socketRoom(socket));
                if (room && room.hasOwnProperty('game'))
                    room.game.removePlayer(room.game.getPlayerByData('socketid', socket.id));
            });

            socket.on('join', function(data) {
                console.log("Player attempting to join room " + data.room + "...");
                socket.leave('lobby');
                socket.join('poker-' + data.room);
                if (socket.id in server.idMap) {
                    console.log("Player join table failed.");
                    socket.emit('join failed', {message: 'Join failed. Already in a table.'});
                    return;
                }

                let room = server.getRoom('poker-' + data.room);
                server.idMap[socket.id] = room;
                // TODO Check database to see if player has money.
                let availableSeat = room.game.getSeat();

                if (availableSeat > -1) {
                    let playerData = {
                        socketid: socket.id,
                        money: data.money
                    };
                    if (room.game.addPlayer(availableSeat, playerData)) {
                        console.log("Player joined table. ");
                        server.sitters[availableSeat] = true;
                        // socket.emit('beSeated', {seatNumber: availableSeat})

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
                if (room.game.playerBet(player, money)) {
                    console.log("Player " + socket.id + " placed a " + parseInt(money) + " bet.");
                } else {
                    console.log("Player " + socket.id + " tried to bet, but the command failed.");
                }

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
        let pausedRooms = this.pausedRooms;
        let pauseTime = 5000;
        var loop = function () {
            let roomKeys = Object.keys(rooms);
            for (let roomID in rooms) {
                let room = rooms[roomID];

                if (roomID != 'lobby' && room) {
                    if (room.game.inPlay()) {
                        if (room in pausedRooms) {
                            let timeLeft = ((server.pausedRooms[room][0] - new Date().getTime()));
                            if (timeLeft > 0) {
                            } else {
                                console.log("Game starting!");
                                room.game.addMessage('Game is starting!');
                                delete server.pausedRooms[room];
                            }
                        }

                        else {
                            // console.log('Play');
                            if (server.oldStage != room.game.stage) {
                                server.oldStage = room.game.stage;

                                // if (room.game.stage == 0) {
                                //
                                // } else if (room.game.stage == 1) {
                                //
                                // } else if (room.game.stage == 2) {
                                //
                                // } else if (room.game.stage == 3) {
                                //
                                // } else if (room.game.stage == 4) {
                                //
                                // } else if (room.game.stage == 5) {
                                //
                                // }

                            }
                        }
                    }

                    else if (room.game.isBeforePlay()) {
                        // console.log('Before Play');
                        server.pausedRooms[room] = [new Date().getTime() + pauseTime, pauseTime];
                        server.sendPause(room, 5);
                        room.game.beforePlaying = false;
                        room.game.playing = true;
                    }

                    room.game.dealer();

                    if (room.game && room.game.hasNewState()) {
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

    private sendPause(room, length) {
        console.log("Game starts in " + length + " seconds");
        for (let i = 0; i < room.game.players.length; i++) {
            let player = room.game.players[i];
            if (player != null) {
                let id = player.get('socketid');
                this.io.to(id).emit('pause', {length: length});
            }
        }
    }

    private sendHands(room) {
        // console.log(room);
        let players = room.game.players;
        for (let i = 0; i < players.length; i++) {
            // this.sendHand(room.game.players[i]);
            if (players[i] != null) {
                // room.game.updateState('hand', players[i].hand.getCardsArray());
            }
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
        let stateChanges = room.game.getStateChanges();
        let state = room.game.getState(); // TODO Remove this. Can't now because it updates player state...
        // console.log(poker.stateChanged);
        for (let i = 0; i < room.game.players.length; i++) {
            let player = room.game.players[i];
            if (player != null) {
                let tempStateChanges = stateChanges.slice();
                // if (room.game.isBeforePlay()) {
                //     tempStateChanges.push(['seat', i]);
                // }
                if (i in this.sitters) {
                    tempStateChanges.push(['seat', i]);
                    delete this.sitters[i];
                }
                if (room.game.stage == 1) {
                    tempStateChanges.push(['hand', player.getHand().getCardsArray()]);
                }
                let id = player.get('socketid');
                // this.io.to(id).emit('newState', {state: state});
                this.io.to(id).emit('updateState', {changes: tempStateChanges});
            }
        }
    }
}