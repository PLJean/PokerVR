import {Poker} from "../game/poker";
import * as socketIo from "socket.io";
import * as fs from "file-system";

export class GameServer {
    private io: any;
    private port: 3000;
    private server;
    oldStage = -1;
    handSent = false;
    pausedRooms = {};
    sitters = {};
    rooms = {};

    idMap = {};
    createNewRooms = true;

    constructor(server) {
        this.server = server;
        // this.roomMap['lobby'] =
        let gameServer = this;
        this.createRoom('lobby');

        let states = this.loadServerState();
        if (!this.createNewRooms && states && Object.keys(states).length > 0 ) {
            for (let roomID in states) {
                console.log('loading ' + roomID);
                let state = states[roomID];
                this.createRoom(roomID,
                    new Poker({type: state['type']}, state)
                );
            }
        }

        else {
            console.log('creating rooms');
            this.createRoom('poker-0', new Poker({type: 'No Limit'}));
            this.createRoom('poker-1', new Poker({type: 'Pot Limit'}));
            this.createRoom('poker-2', new Poker({type: 'No Limit'}));
            this.createRoom('poker-3', new Poker({type: 'Fixed Limit'}));
            this.createRoom('poker-4', new Poker({type: 'Pot Limit'}));
            this.saveServerState();
        }
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
                console.log(game.state['minimum']);
                console.log();
                returnData[room] = {
                    game: 'Poker',
                    type: game.getState('type'),
                    minimum: game.getState('minimum').toString(),
                    maximum: game.getState('maximum'),
                    playerCount: game.getState('playerCount'),
                    maxPlayerCount: game.getState('maxPlayerCount')
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

    loadServerState() {
        try {
            let data = fs.readFileSync(__dirname + '/../../../db/serverStates.json');
            let states;
            if (data) {
                states = JSON.parse(data);
            }
            return states;
        } catch(e) {
            console.log(e);
        }

        return null;
    }

    saveServerState() {
        let states = {};
        for (let roomID in this.rooms) {
            if (roomID != 'lobby' && this.rooms[roomID].game) {
                states[roomID] = this.rooms[roomID].game.getState();
            }
        }

        let json = JSON.stringify(states);
        fs.writeFile(__dirname + '/../../../db/serverStates.json', json, function(err) {
            if (err) {
                return console.log(err);
            }
        });
        console.log("saving state");
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
                let room = server.getRoom(socketRoom(socket));
                if (!room) return;

                // if (room && room.hasOwnProperty('game'))
                //     room.game.removePlayer(room.game.getPlayerByData('socketid', socket.id));
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
                if (!room) return;

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

            // socket.on('rejoin', function() {
            //     let room = server.getRoom(socket.rooms[1]);
            //     if (!room || !room.game) return;
            //
            // });

            socket.on('leave', function () {
                let room = server.getRoom(socket.rooms[1]);
                if (!room || !room.game) return;

                room.game.removePlayer(room.game.getPlayerByData('socketid', socket.id));
            });

            socket.on('fold', function () {
                let room = server.getRoom(socketRoom(socket));
                if (!room || !room.game) return;

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
                if (!room || !room.game) return;

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
                if (!room || !room.game) return;

                let player = room.game.getPlayerByData('socketid', socket.id);
                if (room.game.playerCall(player)) {
                    console.log("Player " + socket.id + " has called");
                } else {
                    console.log("Player " + socket.id + " tried to call, but the command failed.");
                }
            });

            socket.on('rotation', function(data) {
                let room = server.getRoom(socketRoom(socket));
                if (!room || !room.game) return;

                let player = room.game.getPlayerByData('socketid', socket.id);

                let seatNumber = player.get('seatNumber');
                room.game.updateState('rotation.' + seatNumber, {x: data.x, y: data.y, z: data.z});
            })
        });
    }

    private run() {
        let server = this;
        let rooms = this.rooms;
        let pausedRooms = this.pausedRooms;
        let pauseTime = 5000;
        let gameStateCount = 0;
        let stateSaveFrequency = 60;
        let stateSaveTime =  new Date().getTime() / 1000 + stateSaveFrequency;
        var loop = function () {
            let roomKeys = Object.keys(rooms);
            let time = new Date().getTime() / 1000;
            for (let roomID in rooms) {
                try {
                    let room = rooms[roomID];
                    if (roomID != 'lobby' && room) {
                        if (room.game.isPaused()) {
                            let timeLeft = ((server.pausedRooms[room][0] - new Date().getTime()));
                            if (timeLeft > 0) {

                            } else {
                                console.log("Game starting!");
                                room.game.paused = false;
                                room.game.playing = true;
                                room.game.updateState('messages', ['Game is starting!']);
                                delete server.pausedRooms[room];
                            }
                        }

                        else if (room.game.inPlay()) {
                            if (server.oldStage != room.game.stage) {
                                server.oldStage = room.game.stage;
                            }
                        }

                        else if (room.game.isBeforePlay()) {
                            // console.log('Before Play');
                            server.pausedRooms[room] = [new Date().getTime() + pauseTime, pauseTime];
                            server.sendPause(room, 5);
                            room.game.beforePlaying = false;
                            room.game.paused = true;
                        }

                        room.game.dealer();

                        if (room.game && room.game.hasNewState()) {
                            server.sendGameStates(room, ++gameStateCount);
                        }
                    }
                }
                catch(e) {
                    console.log(e);
                }
            }

            if (time > stateSaveTime) {
                server.saveServerState();
                stateSaveTime += stateSaveFrequency;
            }

            again();
        };

        var again = function() {
            setImmediate(loop, rooms);
        };

        loop();
    }

    private sendPause(room, length) {
        // console.log("Game starts in " + length + " seconds");
        // room.game.addMessage("Game starts in " + length + " seconds");
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

    private sendGameStates(room, stateNumber) {
        let stateChanges = room.game.getStateChanges();
        // console.log(poker.stateChanged);
        for (let i = 0; i < room.game.players.length; i++) {
            let player = room.game.players[i];
            if (player != null) {
                let tempStateChanges = stateChanges.slice();
                // if (room.game.isBeforePlay()) {
                //     tempStateChanges.push(['seat', i]);
                // }
                if (room.game.stage == 1) {
                    tempStateChanges.push(['hand', player.getHand().getCardsArray()]);
                }

                if (i in this.sitters) {
                    tempStateChanges.unshift(['seat', i]);
                    delete this.sitters[i];
                }
                let id = player.get('socketid');
                // this.io.to(id).emit('newState', {state: state});
                this.io.to(id).emit('updateState', {id: stateNumber, changes: tempStateChanges});
            }
        }
    }
}