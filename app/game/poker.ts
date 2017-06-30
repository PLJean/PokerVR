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
                // Skip second 'A' symbol
                if (i == 14) continue;
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
    config = {};

    private defaultMinimumBet: number = 2;
    // private minimumBet: number;
    private deck: Deck = new Deck();
    private dealt: Cards  = new Cards();
    private stage: number = 0;
    private lastStage: number = 0;
    private beforePlaying = false;
    private beforePaused = false;
    private playing = false;
    private paused = false;
    private currentPlayerIndex = 0;
    private turnStartPlayerIndex = 0;
    private stageInitialized = false;
    private forceNextStage = false;
    // private playerCount = 0;
    private activePlayerCount = 0;
    // private totalPot = 0;

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

    constructor(config = {}) {
        super();
        this.loadGameType(config['type'], config);
        for (let i = 0; i < this.config['maxPlayers']; i++) {
            this.players.push(null);
        }
        this.defaultMinimumBet = Math.trunc(this.config['minimum'] / 10);
        // this.minimumBet = this.defaultMinimumBet;

        this.updateState('game', 'Poker');
        this.updateState('type', this.config['type']);
        this.updateState('minimum', this.config['minimum']);
        this.updateState('maximum', this.config['maximum']);
        this.updateState('playerCount', 0);
        this.updateState('maxPlayerCount', this.config['maxPlayers']);
        this.updateState('playing', false);
        this.updateState('dealt', []);
        this.updateState('stage', 0);
        this.updateState('minimumBet', Math.trunc(this.config['minimum'] / 10));

        for (let i = 0; i < this.players.length; i++) {
            this.updateState('player.' + i, null)
        }
   }

    loadGameType(type, options) {
        if (type == 'Pot Limit') {
            this.setConfig({
                type: 'Pot Limit',
                maxPlayers: 6,
                dealCount: 2,
                minimum: 20,
                maximum: 200,
            });
        }

        else if (type == 'Fixed Limit') {
            this.setConfig({
                type: 'Fixed Limit',
                maxPlayers: 6,
                dealCount: 2,
                minimum: 20,
                maximum: 200,
            });
        }

        else {
            this.setConfig({
                type: 'No Limit',
                maxPlayers: 6,
                dealCount: 2,
                minimum: 20,
                maximum: 200,
            });
        }

        this.setConfig(options);
    }

    setConfig(options): void {
        if (options) {
            for (let option of Object.keys(options)) {
                this.config[option] = options[option];
            }
        }
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
        return this.getState('playerCount');
       // return this.playerCount;
   }

    playerBet(player, amount) {
        if (this.canBet(player, amount)) {
            for (let i = 0; i < this.players.length; i++) {
                if (this.players[i] && !this.players[i].folded) this.players[i].resetTurn();
            }

            let minimumBet = this.getState('minimumBet');
            if (amount > minimumBet) {
                console.log("amount > minimumBet");
                // this.minimumBet = amount;
                this.updateState('minimumBet', amount);
            }
            player.bet(amount);
            // this.totalPot += amount;
            this.updateState('totalPot', this.getState('totalPot') + amount);
            this.addMessage('Player ' + player.get('seatNumber') + ' has bet ' + amount);


            return true;
        }

        return false;
    }

    playerCall(player) {
        if (player == this.currentPlayer()) {
            let minimumBet = this.getState('minimumBet');

            player.call(minimumBet);
            if (minimumBet == 0) {
                this.addMessage('Player ' + player.get('seatNumber') + ' has called');
            }

            else {
                // this.totalPot += minimumBet;
                this.updateState('totalPot', this.getState('totalPot') + minimumBet);
                this.addMessage('Player ' + player.get('seatNumber') + ' has called ' + this.minimumBet);

            }
            return true;
        }

        return false;
    }

    playerFold(player) {
        if (player == this.currentPlayer()) {
            player.fold();
            this.addMessage('Player ' + player.get('seatNumber') + ' has folded');
            this.activePlayerCount -= 1;
            return true;
        }

        return false;
    }



    inTable(playerID) {
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
        data['minimumBet'] = this.getState('minimumBet');
        if (this.players[seatNumber] != null || this.inTable(data['socketid'])) {
            return false;
        }

        this.players[seatNumber] = new Player(data.money);

        for (let key in data) {
            this.players[seatNumber].set(key, data[key]);
        }

        this.players[seatNumber].set("seatNumber", seatNumber);

        // Update state
        this.addMessage('Player has joined on seat ' + seatNumber);

        // this.playerCount += 1;
        this.updateState('playerCount', this.getState('playerCount') + 1);
        this.players[seatNumber].sitToggle();
        this.stateChanged = true;
        return true;
    }

    getReadyToRemove(player): boolean {
        if (player == null)
            return false;

        player.leaving = true;
    }

    removePlayer(player): boolean {
        if (player == null) {
            return false;
        }

        player.reset(this.deck);
        let seatNumber = player.playerInfo['seatNumber'];
        this.players[seatNumber] = null;

        this.updateState('players.' + seatNumber.toString(), null);
        this.addMessage('Player has left ' + seatNumber);
        // this.playerCount -= 1;
        this.updateState('playerCount', this.getState('playerCount') - 1);
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
        console.log("player: " + player);
        console.log("player has " + amount + ": " + player.has(amount));
        console.log("player actually has: " + player.cash);
        console.log("player is folded: " + player.folded);
        if (player && player.has(amount) && !player.folded) {
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
        for (let i = 0; i < this.config['dealCount']; i++) {
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

    dealer(): boolean {
        if (this.hasMessages()) {
            this.updateState('messages', this.getMessages());
            this.clearMessages();
        }

        if (this.activePlayerCount == 1) {
            this.stage = 5;
            this.initStage();
            this.resetAllPlayers();
            this.nextStage();
            console.log(this.activePlayerCount);
        }

        else if (!this.tableHasTwo()) {
            this.stage = 0;
            return false;
        }

        else {
            if (this.paused) {

            }
            else if (!this.playing && !this.beforePlaying) {
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
        console.log("Next stage... (" +  this.stage + ")");


        this.resetAllPlayerTurns();
        this.currentPlayerIndex = 0;
        this.stageInitialized = false;
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
        this.updateState('turn', this.currentPlayerIndex);
        // console.log("Player " + this.currentPlayerIndex + " Turn");
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

        if (count > 1)
            return true;

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

    rewardMultipleWinners() {
        console.log('multiple winners');
        let totalPot = this.getState('totalPot');
        let rankList = [];

        // Tally up the total pot and get all the HandRanks of the other players and their seat number
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i] && !this.players[i].folded) {
                let handOf7 = this.players[i].hand.getCardsArray().concat(this.dealt.getCardsArray());
                rankList.push([i, new HandRank(handOf7)]);
            }
        }

        for (let i = 0; i < rankList.length; i++) {
            console.log("Player " + rankList[i][0] +  " has rank " + rankList[i][1].rank.rank + " with hand:");
            let rankKeys = Object.keys(rankList[i][1]);
            for (let key in rankKeys) {
                console.log(key + ": " + rankKeys[key]);
            }
            console.log(this.players[rankList[i][0]].hand.getCardsArray());
        }

        // Sort HandRanks by best to worst
        rankList.sort(function(a, b) {
            return HandRank.compareRank(a[1].rank, b[1].rank);
        });
        rankList.reverse();

        console.log('rankList:');
        console.log(rankList);

        // Put equal HandRanks together in the same List Object
        let tempRankIndex = 0;
        let tempRankList = [[rankList[0]]];
        for (let i = 1; i < rankList.length; i++) {
            if (HandRank.compareRank(rankList[i - 1][1].rank, rankList[i][1].rank) == 0) {
                tempRankList[tempRankIndex].push(rankList[i]);
            } else {
                tempRankIndex += 1;
                tempRankList.push([rankList[i]]);
            }
        }

        console.log('tempRankList: ');
        console.log(tempRankList);

        // Create side pots and distribute to highest ranked player
        while (totalPot > 0) {
            console.log('totalPot: ' + totalPot);
            let pot = 0;
            let min = Number.MAX_SAFE_INTEGER;
            let minPlayers = [];

            // Get the players who bet the minimum in this side pot.
            for (let i = 0; i < this.players.length; i++) {
                if (!this.players[i]) continue;

                let potAmount = this.players[i].potAmount;
                console.log("Player " + i + " potAmount is " + this.players[i].potAmount);
                if (potAmount < min) {
                    min = potAmount;
                    minPlayers = [i];
                } else if (potAmount == min){
                    minPlayers.push(i);
                }
            }

            console.log("minPlayers: ");
            console.log(minPlayers);

            // Add up the min pot of all players who have not folded.
            for (let i = 0; i < this.players.length; i++) {
                let player = this.players[i];
                if (player != null && !player.folded) {
                    pot += min;
                }
            }

            console.log("pot: " + pot);

            // tempRankList = [ [[0, new HandRank(handOf7)], [1, new HandRank(handOf7)]], [[4, new HandRank(handOf7)], [3, new HandRank(handOf7)]] ]
            let potSplit = pot / tempRankList[0].length;
            console.log("potSplit: " + potSplit);
            let newRank = [];

            for (let i = 0; i < tempRankList[0].length; i++) {
                let index = minPlayers.indexOf(tempRankList[0][i]);
                // If min player is part of the winning players
                if (index >= 0) {
                    minPlayers.slice(index, 1);
                }

                let playerIndex = tempRankList[0][i][0];
                this.players[playerIndex].cash += potSplit;

                let minIndex = minPlayers.indexOf(playerIndex);
                if (minIndex >= 0) {
                } else {
                    newRank.push(tempRankList[0][i]);
                }
            }

            if (newRank.length == 0) {
                tempRankList.shift();
            } else {
                tempRankList[0] = newRank;
            }

            totalPot -= pot;
            minPlayers.shift();
            totalPot = 0;

            console.log('tempRankList: ');
            console.log(tempRankList);
        }

    }

    rewardOneWinner() {
        console.log('one winner');
        let i = 0;
        let winner;
        let totalPot = this.getState('totalPot');
        while (i < this.players.length) {
            if (this.players[i] && !this.players[i].folded) break;

            i += 1;
        }

        // this.players[i].cash += this.totalPot;
        this.players[i].cash += totalPot;
        this.addMessage('Player ' + i + ' has won ' + totalPot + ' (total: ' + this.players[i].cash + ')');
    }

    private rewardWinners() {

        if (this.activePlayerCount == 1) {
            this.rewardOneWinner();
        }

        else if (this.activePlayerCount > 1) {
            this.rewardMultipleWinners();
        }

        else {
            console.log("No winners?");
        }

        this.forceNextStage = true;
    }

    private dealStage(): void {
        // console.log("Game is in the Deal Stage (0)");

        while (!this.dealt.empty()) {
            this.deck.add(this.dealt.pop());
        }

        // Add player cards back to the deck
        // for (let player of this.players) {
        //     if (player != null) {
        //         this.deck.addCards(player.hand);
        //     }
        // }

        this.resetAllPlayers();

        this.deck.shuffle();

        // Deal players cards
        for (let i = 0; i < this.players.length; i++) {
            let player = this.players[i];
            if (player != null) {
                this.dealPlayer(player);
            }

        }
        this.turnNumber += 1;
        this.updateState('turnNumber', this.turnNumber);
        this.forceNextStage = true;
    }

    private preFlop(): void {
        // console.log("Game is in the Pre Flop Stage (1)");
        // Add dealt cards back to the deck
        // this.minimumBet = this.defaultMinimumBet;
        this.updateState('minimumBet', this.defaultMinimumBet);

        this.updateState('turn', this.currentPlayerIndex);
        this.updateState('dealt', this.dealt.getCardsArray());
    }

    private flop(): void {
        // console.log("Game is in the Flop Stage (2)");
        // this.minimumBet = 0;
        for (let i = 0; i < 3; i++) {
            this.dealt.add(this.deck.pop());
        }

        this.updateState('minimumBet', 0);
        this.updateState('turn', this.currentPlayerIndex);
        this.updateState('dealt', this.dealt.getCardsArray());
    }

    private turnRiver(): void {
        // if (this.stage == 3)
        //     console.log("Game is in the Turn Stage (3)");
        // else
        //     console.log("Game is in the River Stage (4)");

        this.dealt.add(this.deck.pop());

        this.updateState('turn', this.currentPlayerIndex);
        this.updateState('dealt', this.dealt.getCardsArray());
    }

    private resetAllPlayers() {
        this.activePlayerCount = 0;
        this.currentPlayerIndex = 0;

        this.updateState('totalPot', 0);
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i] != null) {
                // this.deck.addCards(this.players[i].hand);
                this.players[i].reset(this.deck);
                this.activePlayerCount += 1;
            }
        }
    }

    private resetAllPlayerTurns() {
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i] != null) {
                this.players[i].resetTurn();
            }
        }
    }

    public connect(socket) {

    }
}