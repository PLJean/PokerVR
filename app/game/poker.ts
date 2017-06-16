import { Cards, Deck } from "./cards";
import { Game, Player } from "./game";
import { subsets } from "./../functions/functions"

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

export class Poker extends Game {
    config = {
        maxPlayers: 6,
        dealCount: 2,
        minimum: 20,
        maximum: 200,
        type: 'No Limit' // Pot, Fixed, or No Limit
    };

    private deck: Deck = new Deck();
    private dealt: Cards  = new Cards();
    private stage: number = 0;
    private lastStage: number = 0;
    private totalPot = 0;
    private beforePlaying = false;
    private beforePaused = false;
    private playing = false;
    private paused = false;
    private currentPlayerIndex = 0;
    private stageInitialized = false;
    private forceNextStage = false;
    private playerCount = 0;
    private ons = {
        'beforePaused': function() {

        },
        'beforePlay': function() {

        },
        'paused': function() {

        },
        'play': function () {
            
        }
    };
    // if (this.isBeforePaused()) {
    //     this.ons['beforePaused']();
    // }
    //
    // else if (this.isBeforePlay()) {
    //     this.ons['beforePlay']();
    // }
    //
    // else if (this.isPaused()) {
    //     this.ons['paused']();
    // }
    //
    // else if (this.inPlay()) {
    //     this.ons['play']();
    // }
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

        // this.paused = true;
   }

    getConfig(name) {
        if (!name) {
            return this.config;
        }
        else if (name in this.config) {
            return this.config[name];
        }
   }

    getPlayerCount() {
       return this.playerCount;
   }

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

    inTable(playerID) {
        console.log(playerID);
        for (let pid in this.players) {
            if (pid != null) {
                let player = this.players[pid];

                if(player) {
                    if (player.get('socketid') == playerID) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    addPlayer(seatNumber, data): boolean {
        if (this.players[seatNumber] != null || this.inTable(data['socketid'])) {
            return false;
        }

        this.players[seatNumber] = new Player(data.money);

        for (let key in data) {
            this.players[seatNumber].set(key, data[key]);
        }

        this.players[seatNumber].set("seatNumber", seatNumber);

        // Update state
        // this.updateState('players.' + seatNumber.toString(), {});
        this.updateState('seat', seatNumber);
        this.playerCount += 1;
        this.players[seatNumber].sitToggle();
        return true;
    }

    removePlayer(player): boolean {
        if (player == null) {
            // console.log("No player to remove");
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
        this.playerCount -= 1;
        return true;
    }

    resetGame() {
        this.stage = 0;
        this.lastStage = 5;
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

    on(stateChange, fn) {
        this.ons[stateChange] = fn;
    }

    processStateChanges() {
        for (let i = 0; i < this.stateChanges.length; i++) {
            let change = this.stateChanges[i][0];
            if (this.isBeforePaused()) {
                this.ons['beforePaused']();
            }

            else if (this.isBeforePlay()) {
                this.ons['beforePlay']();
            }

            else if (this.isPaused()) {
                this.ons['paused']();
            }

            else if (this.inPlay()) {
                this.ons['play']();
            }
            else if (change in this.ons) {
                this.ons[change]();
            }

        }

        this.stateChanges = [];
    }

    // loop () {
    //     if (this.inPlay()) {
    //         if (server.oldStage != this.stage) {
    //             server.oldStage = this.stage;
    //
    //             if (this.stage == 0) {
    //                 server.handSent = false;
    //             } else if (this.stage == 1) {
    //                 if (!server.handSent) {
    //                     server.sendHands(room);
    //                     server.handSent = true;
    //                 }
    //             } else if (this.stage == 2) {
    //
    //             } else if (this.stage == 3) {
    //
    //             } else if (this.stage == 4) {
    //
    //             } else if (this.stage == 5) {
    //
    //             }
    //
    //         }
    //
    //         this.dealer();
    //     }
    //
    //     else if (this.isBeforePlay()) {
    //
    //     }
    //
    //     else if (this.isPaused()) {
    //         server.pausedRooms.push([room, new Date().getTime(), 5]);
    //         server.sendPause(room, 5);
    //     }
    //
    //     else if (this.isBeforePaused()) {
    //
    //     }
    //
    //
    // }

    sendHands() {

    }

    dealer(): boolean {
        if (!this.tableHasTwo()) {
            this.stage = 0;
            return false;
        }

        else {
            if (this.beforePlaying) {

            }

            else if (!this.playing) {
                this.beforePlaying = true;
            }

            else {
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
                        let oldIndex = this.currentPlayerIndex;
                        this.nextPlayer();
                        if (this.currentPlayerIndex == oldIndex) {
                            this.forceNextStage = true;
                        }

                    }
                }

                return true;
            }

        }
    }

    initStage() {
        // console.log("\nInitializing stage...");
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

        let index = this.currentPlayerIndex + 1;
        while (!this.players[index] || this.players[index].folded) {
            if (index > this.players.length)
                index = 0;

            index += 1;
        }

        this.currentPlayerIndex = index;

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
        return this.playing;
    }

    isBeforePlay() {
        return this.beforePlaying;
    }
    isPaused() {
        return this.paused;
    }

    isBeforePaused() {
        return this.beforePaused;
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
        // console.log("Game is in the Deal Stage (0)");

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
        for (let i = 0; i < this.players.length; i++) {
            let player = this.players[i];
            if (player != null) {

                this.dealPlayer(player);
            }

        }

        this.forceNextStage = true;
    }

    public getState() {

        return super.getState();
    }

    private preFlop(): void {
        // console.log("Game is in the Pre Flop Stage (1)");
        // Add dealt cards back to the deck
        this.updateState('dealt', this.dealt.getCardsArray());
    }

    private flop(): void {
        // console.log("Game is in the Flop Stage (2)");
        for (let i = 0; i < 3; i++) {
            this.dealt.add(this.deck.pop());
        }

        this.updateState('dealt', this.dealt.getCardsArray());
    }

    private turnRiver(): void {
        // if (this.stage == 3)
        //     console.log("Game is in the Turn Stage (3)");
        // else
        //     console.log("Game is in the River Stage (4)");

        this.dealt.add(this.deck.pop());
        this.updateState('dealt', this.dealt.getCardsArray());
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