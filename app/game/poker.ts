import { Cards, Deck } from "./cards";
import {Game, Player} from "./game";
// const cardSymbolMap = {'AS': 'Ace of Spades', '2S': '2 of Spades', '3S': '3 of Spades', '4S': '4 of Spades', '5S': '5 of Spades', '6S': '6 of Spades', '7S': '7 of Spades', '8S': '8 of Spades', '9S': '9 of Spades', '0S': '10 of Spades', 'JS': 'Jack of Spades', 'QS': 'Queen of Spades', 'KS': 'King of Spades', 'AD': 'Ace of Diamonds', '2D': '2 of Diamonds', '3D': '3 of Diamonds', '4D': '4 of Diamonds', '5D': '5 of Diamonds', '6D': '6 of Diamonds', '7D': '7 of Diamonds', '8D': '8 of Diamonds', '9D': '9 of Diamonds', '0D': '10 of Diamonds', 'JD': 'Jack of Diamonds', 'QD': 'Queen of Diamonds', 'KD': 'King of Diamonds', 'AC': 'Ace of Clubs', '2C': '2 of Clubs', '3C': '3 of Clubs', '4C': '4 of Clubs', '5C': '5 of Clubs', '6C': '6 of Clubs', '7C': '7 of Clubs', '8C': '8 of Clubs', '9C': '9 of Clubs', '0C': '10 of Clubs', 'JC': 'Jack of Clubs', 'QC': 'Queen of Clubs', 'KC': 'King of Clubs', 'AH': 'Ace of Hearts', '2H': '2 of Hearts', '3H': '3 of Hearts', '4H': '4 of Hearts', '5H': '5 of Hearts', '6H': '6 of Hearts', '7H': '7 of Hearts', '8H': '8 of Hearts', '9H': '9 of Hearts', '0H': '10 of Hearts', 'JH': 'Jack of Hearts', 'QH': 'Queen of Hearts', 'KH': 'King of Hearts'};

function subsets(array, k) {
    let subsetsList = [];
    function subsetRecurse(array, combo, n, k, i) {
        if (i <= n) {
            if (combo.length == k) {
                subsetsList.push(combo);
            }

            else {
                {
                    let newCombo = combo.slice();
                    subsetRecurse(array, newCombo, n, k, i + 1);
                }

                {
                    let newCombo = combo.slice();
                    newCombo.push(array[i]);
                    subsetRecurse(array, newCombo, n, k, i + 1);
                }
            }
        }
    }
    subsetRecurse(array, [], array.length, k, 0);
    return subsetsList;
}

function sum(array: number[]) {
    return array.reduce(function (sum, num) {
        return sum + num;
    });
}

export class HandRank {
    hand: string[];
    info: Object;
    rank;

    constructor(hand: string[]) {
        if (hand.length == 5) {
            this.hand = hand;
            this.rank = HandRank.getRank5(hand);
        }

        else if (hand.length == 7) {
            let tempRank = HandRank.getRank7(hand);
            this.rank = tempRank[0];
            this.hand = tempRank[1];
        }
    }

    static getRank5(hand: string[]) {
        var histograms = HandRank.getHistograms(hand);
        var flush = null;
        var straightLo = -1;
        var straightHi = -1;
        var highs = [];
        var pairs = [];
        var threeKind = null;
        var fourKind = null;

        // Loop through suit histogram
        for (let i = 0; i < 4; i++) {
            if (histograms.suitHistogram[i] == 5) {
                switch(i) {
                    case 0:
                        flush = 'Spades';
                        break;
                    case 1:
                        flush = 'Diamonds';
                        break;
                    case 2:
                        flush = 'Clubs';
                        break;
                    case 3:
                        flush = 'Hearts';
                        break;
                }
            }
        }


        // Loop through symbol histogram
        for (let i = 0; i < 15; i++) {
            let count = histograms.symbolHistogram[i];

            if (count == 0) {
                straightLo = -1;
            }
            else if (count == 1) {
                // Found first possible straight index
                if (straightLo == -1) {
                    straightLo = i;
                }

                // If found an adjacent straight index & checking if straight is completed
                else if (straightLo > - 1 && i - straightLo == 4) {
                    straightHi = i;
                    break;
                }
            }

            else if (count == 2) {
                pairs.push(i);
            }

            else if (count == 3) {
                threeKind = i;
            }

            else if (count == 4) {
                fourKind = i;
                break;
            }
        }

        if (pairs.length == 1) {
            if (threeKind != null) {
                // console.log("Full House");
                return {rank: 6, pair3: threeKind, pairs: pairs[0], highCards: highs}
            }
            else {
                // console.log("One Pair");
                return {rank: 1, pairs1: pairs[0], highCards: highs};
            }
        }

        else if (pairs.length == 2) {
            // console.log("Two Pairs");
            return {rank: 2, pairs2: pairs, highCards: highs};
        }

        else if (threeKind != null) {
            // console.log("Three of a Kind");
            return {rank: 3, threeKind: threeKind, highCards: highs};
        }

        else if (fourKind != null) {
            // console.log("Four of a Kind");
            return {rank: 7, fourKind: fourKind, highCards: highs};
        }

        // If we have a straight
        else if (straightLo == 10 && straightHi == 14 && flush != null) {
            // console.log("Royal Flush");
            return {rank: 9, suit: flush, highCards: highs};
        }

        else if (straightHi != -1 && flush != null) {
            // console.log("Straight Flush");
            return {rank: 8, suit: flush, highCards: highs};
        }

        else if (straightHi != -1) {
            // console.log("Straight");
            return {rank: 4, straightLo: straightLo, straightHi: straightHi, highCards: highs};
        }

        else if (flush != null) {
            // console.log("Flush");
            return {rank: 5, suit: flush, highCards: highs};
        }

        return {rank: 0, highCards: highs}
    }


    static getRank7(hand: string[]) {
        let handCombinations = subsets(hand, 5);
        let maxIndex = 0;
        let maxRank = HandRank.getRank5(handCombinations[0]);
        for (let i = 1; i < handCombinations.length; i++) {
            let rank = HandRank.getRank5(handCombinations[i]);
            if (HandRank.compareRank(rank, maxRank) == 1) {
                maxRank = rank;
                maxIndex = i;
            }
        }

        return [maxRank, handCombinations[maxIndex]];
    }

    static compareRank(rankA, rankB): number {
        if (rankA.rank > rankB.rank) {
            return 1;
        }

        else if (rankA.rank < rankB.rank) {
            return -1;
        }

        return 0;
    }

    private static getHistograms(hand) {
        var suitHistogram = [0, 0, 0, 0];
        var symbolHistogram = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

        for (let i = 0; i < hand.length; i++) {
            let symbol: string = hand[i][0];
            let suit: string = hand[i][1];


            switch(symbol) {
                case 'A':
                    symbolHistogram[1] += 1;
                    symbolHistogram[14] += 1;
                    break;
                case '0':
                    symbolHistogram[10] += 1;
                    break;
                case 'J':
                    symbolHistogram[11] += 1;
                    break;
                case 'Q':
                    symbolHistogram[12] += 1;
                    break;
                case 'K':
                    symbolHistogram[13] += 1;
                    break;
                default:
                    symbolHistogram[parseInt(symbol)] += 1;
                    break;
            }

            switch(suit) {
                case 'S':
                    suitHistogram[0] += 1;
                    break;
                case 'D':
                    suitHistogram[1] += 1;
                    break;
                case 'C':
                    suitHistogram[2] += 1;
                    break;
                case 'H':
                    suitHistogram[3] += 1;
                    break;
            }
        }

        return {
            symbolHistogram: symbolHistogram,
            suitHistogram: suitHistogram
        }
    }
}

// export class Player {
//     cash: number = 0;
//     hand: Cards = new Cards();
//     betAmount: number = 0;
//     folded: boolean = true;
//     playerInfo = {
//         'socketid': null
//     };
//
//     private state = {
//         turn: 0,
//         action: [null, null],
//         cash: 0,
//     };
//
//     public stateHasChanged = true;
//
//     constructor(money) {
//         this.cash = money;
//     }
//
//     call() {
//         this.state.action = [1, null];
//         this.stateHasChanged = true;
//     }
//
//     bet(amount) {
//         this.betAmount += amount;
//         this.state.action =  [2, amount];
//         this.stateHasChanged = true;
//     }
//
//     fold(): void {
//         this.folded = true;
//         this.state.action = [3, null];
//         this.stateHasChanged = true;
//     }
//
//     isDone(): boolean {
//         if (this.state.action) {
//             return true;
//         }
//
//         return false;
//     }
//
//     isFolded(): boolean {
//         return this.folded;
//     }
//
//     getHand() {
//         return this.hand;
//     }
//
//     reset(deck: Cards) {
//         this.betAmount = 0;
//         this.folded = false;
//         this.state.action = null;
//         this.hand.clear();
//         if (deck != null) {
//             deck.addCards(this.hand);
//         }
//         this.stateHasChanged = true;
//     }
//
//     resetTurn() {
//         this.betAmount = 0;
//         this.folded = false;
//         this.state.action = null;
//         this.stateHasChanged = true;
//     }
//
//     has(amount) {
//         return amount >= 0 && amount < this.cash;
//     }
//
//     get(key) {
//         // console.log(this.betAmount);
//         // console.log(this.playerInfo);
//         if (this.playerInfo.hasOwnProperty(key)) {
//             return this.playerInfo[key];
//         }
//
//         return null;
//     }
//
//     set(key, value) {
//         this.playerInfo[key] = value;
//     }
//
//     getState() {
//         console.log(this.cash);
//         this.state.cash = this.cash;
//         console.log(this.state);
//         this.stateHasChanged = false;
//         return this.state;
//     }
//
//     addMoney(money) {
//         this.cash += money;
//     }
// }

// class Game {
//     protected players: Player[] = [];
//     protected state = {};
//     protected stateChanged: boolean = false;
//
//     public getState() {
//         for (let i = 0; i < this.players.length; i++) {
//             if (this.players[i] != null && this.players[i].stateHasChanged) {
//                 this.updateState('players.' + i, this.players[i].getState());
//             }
//         }
//
//         this.stateChanged = false;
//
//         return this.state;
//     }
//
//     public hasNewState() {
//         return this.stateChanged;
//     }
//
//     public updateState(key, value) {
//         if (!key) return;
//
//         let keys = key.split('.');
//         if (keys.length != 0) {
//             let object = this.state;
//             for (let i = 0; i < keys.length - 1; i++) {
//                 object = object[keys[i]];
//             }
//
//             if (value != null) {
//                 object[keys[keys.length - 1]] = value;
//             } else {
//                 delete object[keys[keys.length - 1]];
//             }
//         }
//
//         this.stateChanged = true;
//     }
//
//     public apply(method, args) {
//         console.log(this);
//     }
// }

export class Poker extends Game {
    config = {
        maxPlayers: 6,
        dealCount: 2,
        minimum: 2
    };

    private deck: Deck = new Deck();
    private dealt: Cards  = new Cards();
    private stage: number = 0;
    // private players: Player[] = [];
    private totalPot = 0;

    private joinQueue = [];
    private leaveQueue = [];
    private playing = false;
    private currentPlayerIndex = 0;
    private stageInitialized = false;
    private forceNextStage = false;
    // private callbacks = {};

    // private state = {
    //     game: 'Poker',
    //     playing: false,
    //     players: {
    //
    //     },
    //     dealt: [],
    //     stage: 0
    // };

    // private stateChanged = false;


    constructor(config = null) {
        super();
        this.setConfig(config);
        for (let i = 0; i < this.config.maxPlayers; i++) {
            this.players.push(null);
        }

        // this.callbacks['statechange'] = function() {};
        this.state = {
            game: 'Poker',
            playing: false,
            players: {

            },
            dealt: [],
            stage: 0
        };
   }

    // getState() {
    //
    // }

    // hasNewState() {
    //     return this.stateChanged;
    // }

    playerBet(player, amount) {
        // console.log(player == this.currentPlayer());
        // console.log(this.canBet(player, amount));
        if (player == this.currentPlayer() && this.canBet(player, amount)) {
            player.bet(amount);
            return true;
        }

        return false;
    }

    playerCall(player) {
        if (player == this.currentPlayer()) {
            player.call();
            return true;
        }

        return false;
    }

    playerFold(player) {
        if (player == this.currentPlayer()) {
            player.fold();
            return true;
        }

        return false;
    }

    setConfig(options): void {
        if (options) {
            for (let option of Object.keys(options)) {
                this.config[option] = options[option];
            }
        }
    }

    addPlayer(seatNumber, data): boolean {
        if (this.players[seatNumber] != null) {
            return false;
        }

        this.players[seatNumber] = new Player(data.money);

        for (let key in data) {
            this.players[seatNumber].set(key, data[key]);
        }

        this.players[seatNumber].set("seatNumber", seatNumber);

        // Update state
        this.updateState('players.' + seatNumber.toString(), {});

        return true;
    }

    updateState(key, value) {
        // if (!key) return;
        //
        // let keys = key.split('.');
        // if (keys.length != 0) {
        //     let object = this.state;
        //     for (let i = 0; i < keys.length - 1; i++) {
        //         object = object[keys[i]];
        //     }
        //
        //     if (value != null) {
        //         object[keys[keys.length - 1]] = value;
        //     } else {
        //         delete object[keys[keys.length - 1]];
        //     }
        // }
        this.state['dealt'] = this.dealt.getCardsArray();
        super.updateState(key, value);

        // this.stateChanged = true;
    }

    removePlayer(player): boolean {
        if (player == null) {
            console.log("No player to remove");
            return false;
        }

        player.reset(this.deck);
        let seatNumber = player.playerInfo['seatNumber'];
        this.players[seatNumber] = null;

        // Reset poker only if the table is empty
        if (!this.tableHasTwo()) {
            this.resetGame();
        }

        this.updateState('players.' + seatNumber.toString(), null);
        return true;
    }

    resetGame() {
        this.stage = 0;
        this.playing = false;
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i] != null) this.players[i].reset(this.deck);
        }
     }

    getPlayerBySeat(seatNumber): Player {
        return this.players[seatNumber];
    }

    getPlayerByData(dataName, value) {
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i] != null && this.players[i].playerInfo[dataName] == value) {
                return this.players[i];
            }
        }

        return null;
    }

    canBet(player, amount) {
        // console.log("player: " + player);
        // console.log("has amount: " + !player.has(amount));
        if (player && !player.has(amount) && !player.folded) {
            return true;
        }

        return false;
    }

    allDone(): boolean {
        for (let player of this.players) {
            // console.log(player);
            if (player != null && !player.isDone()) {
                return false;
            }
        }

        return true;
    }

    dealPlayer(player: Player) {
        for (let i = 0; i < this.config.dealCount; i++) {
            player.hand.add(this.deck.pop());
        }
    }

    currentPlayer() {
        return this.players[this.currentPlayerIndex];
    }

    dealer(): boolean {
        if (!this.tableHasTwo()) {
            this.stage = 0;
            this.playing = false;
            if (this.playing) this.updateState('playing', false);
            return false;
        } else {
            if (!this.playing) this.updateState('playing', true);

            this.playing = true;

            if (!this.stageInitialized) {
                this.initStage();
            }

            else if (this.forceNextStage) {
                this.forceNextStage = false;
                this.currentPlayerIndex = 0;
                this.nextStage();
            }

            else if (this.currentPlayer().isDone()) {
                if (this.allDone()) {
                    this.nextStage();
                } else {
                    this.nextPlayer();
                }
            }

            return true;
        }
    }

    initStage() {
        console.log("\nInitializing stage...");
        switch (this.stage) {
            case 0:
                this.dealStage();
                break;
            case 1:
                this.preFlop();
                break;
            case 2:
                this.flop();
                break;
            case 3:
            case 4:
                this.turnRiver();
                break;
            case 5:
                this.rewardWinners();
                break;
        }

        this.stageInitialized = true;
        this.updateState('stage', this.stage);
    }

    nextStage() {
        this.stage += 1;
        if (this.stage > 5) {
            this.stage = 0;
        }
        // console.log("Next stage... (" +  this.stage + ")");


        this.resetAllPlayerTurns();

        this.stageInitialized = false;
        this.currentPlayerIndex = 0;
    }

    nextPlayer() {
        if (this.tableEmpty()) return;

        let index = this.currentPlayerIndex;
        do {
            if (this.players[++index] != null) {
                this.currentPlayerIndex = index;
                return;
            }

            if (index > this.players.length) index = 0;
        } while (1);

        console.log("Player " + this.currentPlayerIndex + " Turn");
    }

    tableFull() {
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i] == null) return false;
        }

        return true;
    }

    tableEmpty() {
        for (let i = 0; i < this.players.length; i++) {
            // console.log(this.players[i]);
            if (this.players[i] != null) return false;
        }

        return true;
    }

    tableHasTwo() {
        let count = 0;
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i] != null) count++;
        }

        if (count > 1) return true;

        return false;
    }

    inPlay() {
        if (this.tableHasTwo()) return true;

        return false;
    }

    getSeat(seat = null): number {
        // If no specified seat, then search for an empty seat
        if (seat == null) {
            for (let i = 0; i < this.players.length; i++) {
                if (this.players[i] == null) {
                    return i;
                }
            }

            return -1;
        }

        else return this.players[seat] != null ? seat : null;
    }

    private rewardWinners() {
        var winningPlayers = [];
        var winningRanks = [];

        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i] && !this.players[i].folded) {
                let handOf7 = this.players[i].hand.getCardsArray().concat(this.dealt.getCardsArray());
                let playerRank = new HandRank(handOf7);

                if (winningRanks.length == 0) {
                    winningRanks.push(playerRank.rank);
                } else {
                    // console.log(winningRanks);
                    let comparison = HandRank.compareRank(playerRank.rank, winningRanks[0].rank);
                    if (comparison == 1) {
                        winningPlayers = [i];
                        winningRanks = [playerRank.rank];
                    }

                    else if (comparison == 0) {
                        winningPlayers.push(i);
                        winningRanks.push(playerRank.rank);
                    }
                }
            }
        }

        // Get bet percentage of player and reward accordingly.
        for (let i = 0; i < winningPlayers.length; i++) {
            console.log("Player " + winningPlayers[i] + " won with " + this.players[winningPlayers[i]].hand.getCardsArray());
            this.players[winningPlayers[i]].addMoney(this.totalPot * this.players[winningPlayers[i]].betAmount / this.totalPot);
        }

        this.forceNextStage = true;
    }

    private dealStage(): void {
        console.log("Game is in the Deal Stage (0)");

        while (!this.dealt.empty()) {
            this.deck.add(this.dealt.pop());
        }

        // Add plsyer cards back to the deck
        for (let player of this.players) {
            if (player != null) {
                this.deck.addCards(player.hand);
            }
        }

        this.resetAllPlayers();


        this.deck.shuffle();

        // Deal players cards
        for (let player of this.players) {
            if (player != null) {
                this.dealPlayer(player);
            }
        }

        this.forceNextStage = true;
    }

    private preFlop(): void {
        console.log("Game is in the Pre Flop Stage (1)");
        // Add dealt cards back to the deck

    }

    private flop(): void {
        console.log("Game is in the Flop Stage (2)");
        for (let i = 0; i < 3; i++) {
            this.dealt.add(this.deck.pop());
        }
    }

    private turnRiver(): void {
        if (this.stage == 3)
            console.log("Game is in the Turn Stage (3)");
        else
            console.log("Game is in the River Stage (4)");

        this.dealt.add(this.deck.pop());
    }

    private resetAllPlayers() {
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i] != null) this.players[i].reset(this.deck);
        }
    }

    private resetAllPlayerTurns() {
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i] != null) this.players[i].resetTurn();
        }
    }

    public connect(socket) {

    }
}

// export class GameServer {
//     private io: any;
//     private port: 3000;
//     private server;
//     oldStage = -1;
//     handSent = false;
//
//     rooms = {
//
//     };
//
//     idMap = {
//
//     };
//
//     constructor(server) {
//         this.server = server;
//         // this.roomMap['lobby'] =
//         let gameServer = this;
//         this.createRoom('lobby');
//         this.createRoom('poker-0', new Poker());
//         this.createRoom('poker-1', new Poker());
//     }
//
//     public listen(port, fn) {
//         this.io = socketIo(this.server);
//         this.initIO();
//         this.server.listen(port, fn);
//         this.run();
//
//     }
//
//     public getRooms(includePlayer): object {
//         let rooms = this.rooms;
//         if (includePlayer) {
//
//         }
//
//         return this.rooms;
//     }
//
//     public getRoom(name) {
//         return this.rooms[name];
//     }
//
//     public createRoom(name, game = null) {
//         if (name == 'lobby') {
//             this.rooms[name] = {};
//         } else {
//             this.rooms[name] = {game: game};
//         }
//     }
//
//     initIO () {
//         var server = this;
//         var socketRoom = function(socket) {
//             let keys = Object.keys(socket.rooms);
//             return socket.rooms[keys[1]];
//         };
//
//         this.io.on('connection', function(socket) {
//             console.log('Player ' + socket.id + ' entered the room.');
//
//             socket.join('lobby');
//
//             socket.emit('rooms',  {rooms: server.getRooms(false)});
//
//             socket.on('disconnecting', function() {
//                 console.log('Player ' + socket.id + ' has left the room.');
//                 console.log(socket);
//                 let room = server.getRoom(socketRoom(socket));
//                 if (room && room.hasOwnProperty('game'))
//                     room.game.removePlayer(room.game.getPlayerByData('socketid', socket.id));
//             });
//
//             socket.on('join', function(data) {
//                 console.log("Player attempting to join...");
//                 socket.leave('lobby');
//                 socket.join(data.room);
//                 let room = server.getRoom(data.room);
//                 // TODO Check database to see if player has money.
//                 let availableSeat = room.game.getSeat();
//
//                 if (availableSeat > -1) {
//                     let playerData = {
//                         socketid: socket.id,
//                         money: data.money
//                     };
//                     if (room.game.addPlayer(availableSeat, playerData)) {
//                         console.log("Player joined table. ");
//                         socket.emit('beSeated', {seatNumber: availableSeat})
//
//                     } else {
//                         console.log("Player join table failed.");
//                         socket.emit('join failed', {message: 'Join failed. Room is full.'});
//                     }
//                 } else {
//                     socket.emit('join failed', {message: 'Table is full'});
//                 }
//             });
//
//             socket.on('leave', function () {
//                 let room = server.getRoom(socket.rooms[1]);
//                 room.game.removePlayer(room.game.getPlayerByData('socketid', socket.id));
//             });
//
//             socket.on('fold', function () {
//                 let room = server.getRoom(socketRoom(socket));
//                 let player = room.game.getPlayerByData('socketid', socket.id);
//                 if (player && room.game.playerFold(player)) {
//                     console.log("Player " + socket.id + " has folded");
//                 } else {
//                     console.log("Player " + socket.id + " tried to fold, but the command failed.");
//                 }
//
//                 // poker.dealer();
//             });
//
//             socket.on('bet', function(money) {
//                 if (!money) {
//                     console.log("Player " + socket.id + " tried to bet, but amount was null.");
//                 }
//
//                 money = money.money;
//
//                 let room = server.getRoom(socketRoom(socket));
//
//                 let player = room.game.getPlayerByData('socketid', socket.id);
//                 console.log("/////////////////////");
//                 if (room.game.playerBet(player, money)) {
//                     console.log("Player " + socket.id + " placed a " + parseInt(money) + " bet.");
//                 } else {
//                     console.log("Player " + socket.id + " tried to bet, but the command failed.");
//                 }
//                 console.log("/////////////////////");
//
//                 // poker.dealer();
//             });
//
//             socket.on('call', function() {
//                 let room = server.getRoom(socketRoom(socket));
//
//                 let player = room.game.getPlayerByData('socketid', socket.id);
//                 if (room.game.playerCall(player)) {
//                     console.log("Player " + socket.id + " has called");
//                 } else {
//                     console.log("Player " + socket.id + " tried to call, but the command failed.");
//                 }
//             });
//
//             socket.on('action', function() {
//
//             })
//         });
//     }
//
//     private run() {
//         let server = this;
//         let rooms = this.rooms;
//
//         var loop = function () {
//             let roomKeys = Object.keys(rooms);
//             for (let roomID in rooms) {
//                 // console.log("\n");
//                 // console.log(room);
//                 // console.log(room.game);
//                 if (roomID != 'lobby' && rooms[roomID] && rooms[roomID].game.inPlay()) {
//                     let room = rooms[roomID];
//                     if (server.oldStage != room.game.stage) {
//                         server.oldStage = room.game.stage;
//
//                         if (room.game.stage == 0) {
//                             server.handSent = false;
//                         } else if (room.game.stage == 1) {
//                             if (!server.handSent) {
//                                 server.sendHands(room);
//                                 server.handSent = true;
//                             }
//                         } else if (room.game.stage == 2) {
//
//                         } else if (room.game.stage == 3) {
//
//                         } else if (room.game.stage == 4) {
//
//                         } else if (room.game.stage == 5) {
//
//                         }
//
//                     }
//                     room.game.dealer();
//
//                     if (room.game.hasNewState()) {
//                         server.sendGameStates(room);
//                     }
//                 }
//             }
//
//             again();
//         };
//
//         var again = function() {
//             setImmediate(loop, rooms);
//         };
//
//         loop();
//     }
//
//     private sendHands(room) {
//         for (let i = 0; i < room.game.players.length; i++) {
//             this.sendHand(room.game.players[i]);
//         }
//
//         this.handSent = true;
//     }
//
//     private sendHand(player) {
//         if (player != null) {
//             let id = player.get('socketid');
//             this.io.to(id).emit('hand', {hand: player.hand.getCardsArray()});
//             console.log("Hand (" + player.hand.getCardsArray().toString() + ") sent to player " + id);
//         }
//     }
//
//     private sendGameStates(room) {
//         let state = room.game.getState();
//         // console.log(poker.stateChanged);
//         for (let i = 0; i < room.game.players.length; i++) {
//             let player = room.game.players[i];
//             if (player != null) {
//                 let id = player.get('socketid');
//                 this.io.to(id).emit('gameState', {state: state});
//             }
//         }
//         console.log(room.game.stateChanged);
//     }
// }