let assert = require('assert');
let gameApp = require(__dirname + '/../app/game/game.js');
let pokerApp = require(__dirname + '/../app/game/poker.js');
let cardsApp = require(__dirname + '/../app/game/cards.js');

describe('Game', function () {
    describe('updateState-0', function () {
        it('Should set state["red"]["blue"] to the value 3', function () {
            let game = new gameApp.Game();
            game.updateState('red.blue', 3);
            assert.equal(game.state['red']['blue'], 3);
        });
    });

    describe('updateState-1', function () {
        it('Should set state["game"] to the value Chess', function () {
            let game = new gameApp.Game();
            game.updateState('game', 'Chess');
            assert.equal(game.state['game'], 'Chess');
        });
    });

    describe('updateState-2', function () {
        it('Should NOT set state to {"foo": "bar"}', function () {
            let game = new gameApp.Game();
            game.updateState('', {'foo': 'bar'});
            assert.equal(Object.keys(game.state).length, 0);
        });
    });
});

describe('HandRank-7', function() {
    describe('onePair-0', function () {
        it('Hand should be a one pair', function() {
            let hand = new cardsApp.Cards(['AS', 'AD', 'KD', '0C', '2H', '4H', '5H']);
            let handRank = new pokerApp.HandRank(hand.getCardsArray());
            assert.equal(handRank.rank.rank, 1);
        })
    });

    describe('twoPairs-0', function () {
        it('Hand should be have two pairs', function() {
            let hand = new cardsApp.Cards(['AS', 'AD', 'KD', '0C', 'KH', '4H', '5H']);
            let handRank = new pokerApp.HandRank(hand.getCardsArray());
            assert.equal(handRank.rank.rank, 2);
        })
    });

    describe('threeOfAKind-0', function() {
        it('Hand should have three of a kind', function() {
            let hand = new cardsApp.Cards(['AS', 'AD', 'AC', '0C', 'KH', '4H', '5H']);
            let handRank = new pokerApp.HandRank(hand.getCardsArray());
            assert.equal(handRank.rank.rank, 3);
        })
    });

    describe('straight-0', function() {
        it('Hand should be a straight', function() {
            let hand = new cardsApp.Cards(['AS', 'KS', '0S', 'JC', '2H', 'QH', '4H']);
            let handRank = new pokerApp.HandRank(hand.getCardsArray());
            assert.equal(handRank.rank.rank, 4);
        })
    });

    describe('flush-0', function() {
        it('Hand should be a flush', function() {
            let hand = new cardsApp.Cards(['2C', '4C', '0S', 'JC', '5C', 'KC', '4H']);
            let handRank = new pokerApp.HandRank(hand.getCardsArray());
            assert.equal(handRank.rank.rank, 5);
        })
    });

    describe('flush-1', function() {
        it('Hand should be a flush', function() {
            let hand = new cardsApp.Cards(['2C', '4C', 'QC', 'JC', '5C', 'KC', '7C']);
            let handRank = new pokerApp.HandRank(hand.getCardsArray());
            assert.equal(handRank.rank.rank, 5);
        })
    });

    describe('fullHouse-0', function() {
        it('Hand should be a full house', function() {
            let hand = new cardsApp.Cards(['2C', '2C', 'QH', 'QD', '5C', 'QS', '7C']);
            let handRank = new pokerApp.HandRank(hand.getCardsArray());
            assert.equal(handRank.rank.rank, 6);
        })
    });

    describe('fourOfAKind-0', function() {
        it('Hand should have four of a kind', function() {
            let hand = new cardsApp.Cards(['AS', 'AD', 'AC', '0C', 'KH', 'AH', '5H']);
            let handRank = new pokerApp.HandRank(hand.getCardsArray());
            assert.equal(handRank.rank.rank, 7);
        })
    });

    describe('straightFlush-0', function() {
        it('Hand should be a straight flush', function() {
            let hand = new cardsApp.Cards(['2C', '4C', '4H', '4D', '5C', '3C', 'AC']);
            let handRank = new pokerApp.HandRank(hand.getCardsArray());
            assert.equal(handRank.rank.rank, 8);
        })
    });

    describe('royalFlush-0', function() {
        it('Hand should be a royal flush', function() {
            let hand = new cardsApp.Cards(['AD', 'JD', '0D', '2H', '7C', 'KD', 'QD']);
            let handRank = new pokerApp.HandRank(hand.getCardsArray());
            assert.equal(handRank.rank.rank, 9);
        })
    });
});

describe('Poker', function () {
    describe("Stages", function () {
        it('Should be in PreFlop Stage', function () {
            let poker = new pokerApp.Poker();
            poker.addPlayer(0, {socketid: 'dummy0', money: 100});
            poker.addPlayer(1, {socketid: 'dummy1', money: 120});
            poker.dealer();
            poker.beforePlaying = false;
            poker.playing = true;
            poker.dealer();

            assert.equal(0, poker.stage);

            poker.players[0].call();
            poker.players[1].call();
            poker.dealer();
            console.log(poker.allDone());
            poker.dealer();
            assert.equal(1, poker.stage);

            poker.players[0].call();
            poker.players[1].call();
            poker.dealer();
            poker.dealer();
            assert.equal(2, poker.stage);

            poker.players[0].call();
            poker.players[1].call();
            poker.dealer();
            poker.dealer();
            assert.equal(3, poker.stage);

            poker.players[0].call();
            poker.players[1].call();
            poker.dealer();
            poker.dealer();
            assert.equal(4, poker.stage);

            poker.players[0].call();
            poker.players[1].call();
            poker.dealer();
            poker.dealer();
            assert.equal(5, poker.stage);

        });
    });

    describe('bet-0', function() {
        it('Should make player 0 bet 100 and player 1 call 100', function () {
            let poker = new pokerApp.Poker();
            poker.addPlayer(0, {socketid: 'dummy0', money: 100});
            poker.addPlayer(1, {socketid: 'dummy1', money: 100});
            poker.dealer();
            poker.beforePlaying = false;
            poker.playing = true;

            poker.dealer(); // Init Stage
            poker.dealer(); // Next Stage

            poker.dealer(); // Init Stage
            poker.playerBet(poker.players[0], 100);
            assert.equal(100, poker.players[0].potAmount);
            assert.equal(0, poker.players[0].cash);
            assert.equal(100, poker.minimumBet);
            poker.dealer();
            poker.playerCall(poker.players[1]);
            assert.equal(100, poker.players[1].potAmount);
            assert.equal(0, poker.players[1].cash);
        });
    });

    describe('fold-0', function() {
        it ('Should make player 0 fold and player 1 win the total pot (150)', function() {
            let poker = new pokerApp.Poker();
            poker.addPlayer(0, {socketid: 'dummy0', money: 100});
            poker.addPlayer(1, {socketid: 'dummy1', money: 100});

            poker.dealer();
            poker.beforePlaying = false;
            poker.playing = true;

            poker.dealer(); // Init Stage
            poker.dealer(); // Next Stage

            poker.dealer(); // Init Stage
            poker.playerBet(poker.players[0], 50);
            poker.dealer();
            poker.playerCall(poker.players[1]);
            assert.equal(2, poker.activePlayerCount);
            poker.dealer(); // Init Stage
            poker.playerFold(poker.players[0]);
            assert.equal(1, poker.activePlayerCount);
            poker.dealer(); // Next Stage
            assert.equal(50, poker.players[0].cash);
            assert.equal(150, poker.players[1].cash);
        });
    });

    describe('fold-1', function() {
        it ('Should make player 1 fold, game continues with player 0 & 2, player 0 fold, and player 2 win.', function() {
            let poker = new pokerApp.Poker();
            poker.addPlayer(0, {socketid: 'dummy0', money: 100});
            poker.addPlayer(1, {socketid: 'dummy1', money: 100});
            poker.addPlayer(2, {socketid: 'dummy2', money: 100});

            poker.dealer();
            poker.beforePlaying = false;
            poker.playing = true;

            poker.dealer(); // Init Stage
            poker.dealer(); // Next Stage

            poker.dealer(); // Init Stage
            poker.playerBet(poker.players[0], 50);
            poker.dealer();
            poker.playerFold(poker.players[1]);
            poker.dealer();
            poker.playerCall(poker.players[2]);
            poker.dealer();
            assert.equal(50, poker.players[0].cash);
            assert.equal(50, poker.players[2].cash);

            assert.equal(2, poker.activePlayerCount);
            poker.dealer(); // Init Stage
            poker.playerFold(poker.players[0]);
            assert.equal(1, poker.activePlayerCount);
            poker.dealer(); // Next Stage
            poker.dealer(); // Next Stage
            assert.equal(50,  poker.players[0].cash);
            assert.equal(100,  poker.players[1].cash);
            assert.equal(150, poker.players[2].cash);
        });
    });

    describe('rewardWinners-0', function() {
        it('Should make player 0 win 200 and player 1 lose all money', function() {
            let poker = new pokerApp.Poker();
            poker.addPlayer(0, {socketid: 'dummy0', money: 100});
            poker.addPlayer(1, {socketid: 'dummy1', money: 100});
            poker.dealer();
            poker.beforePlaying = false;
            poker.playing = true;

            poker.dealer(); // Init Stage
            assert.equal(0, poker.stage);
            poker.players[0].hand = new cardsApp.Cards(['AS', 'AD']);
            poker.players[1].hand = new cardsApp.Cards(['2D', '3H']);
            poker.dealer(); // Next Stage

            poker.dealer(); // Init Stage
            assert.equal(100, poker.players[0].cash);
            console.log(poker.players[0].cash);
            poker.playerBet(poker.players[0], 100);
            poker.dealer(); // Next Player
            assert.equal(100, poker.players[1].cash);
            poker.playerCall(poker.players[1]);
            poker.dealer(); // Next Stage
            assert.equal(0, poker.players[0].cash);
            assert.equal(0, poker.players[1].cash);

            poker.dealer(); // Init Stage
            poker.playerCall(poker.players[0]);
            poker.dealer(); // Next Player
            poker.playerCall(poker.players[1]);
            poker.dealer(); // Next Stage
            assert.equal(0, poker.players[0].cash);
            assert.equal(0, poker.players[1].cash);

            poker.dealer(); // Init Stage
            poker.playerCall(poker.players[0]);
            poker.dealer(); // Next Player
            poker.playerCall(poker.players[1]);
            poker.dealer(); // Next Stage
            assert.equal(0, poker.players[0].cash);
            assert.equal(0, poker.players[1].cash);

            poker.dealer(); // Init Stage
            poker.playerCall(poker.players[0]);
            poker.dealer(); // Next Player
            poker.playerCall(poker.players[1]);
            poker.dealer(); // Next Stage
            assert.equal(0, poker.players[0].cash);
            assert.equal(0, poker.players[1].cash);
            assert.equal(100, poker.players[0].potAmount);
            assert.equal(100, poker.players[1].potAmount);

            poker.dealt = new cardsApp.Cards(['AC', 'AH', '3D', '2H', '7C']);
            poker.dealer(); // Init stage
            poker.playerCall(poker.players[0]);
            poker.dealer(); // Next Player
            poker.playerCall(poker.players[1]);
            poker.dealer(); // Next Stage

            assert.equal(200, poker.players[0].cash);
            assert.equal(0,   poker.players[1].cash);
        })
    });

    describe('rewardWinners-1', function() {
        it('Should make player 1 win 200 and player 0 lose all money', function() {
            let poker = new pokerApp.Poker();
            poker.addPlayer(0, {socketid: 'dummy0', money: 100});
            poker.addPlayer(1, {socketid: 'dummy1', money: 100});
            poker.dealer();
            poker.beforePlaying = false;
            poker.playing = true;

            poker.dealer(); // Init Stage
            assert.equal(0, poker.stage);
            poker.players[0].hand = new cardsApp.Cards(['AS', 'AH']);
            poker.players[1].hand = new cardsApp.Cards(['KD', 'QD']);
            poker.dealer(); // Next Stage

            poker.dealer(); // Init Stage
            poker.playerBet(poker.players[0], 100);
            poker.dealer(); // Next Player
            assert.equal(100, poker.players[1].cash);
            poker.playerCall(poker.players[1]);
            poker.dealer(); // Next Stage
            assert.equal(0, poker.players[0].cash);
            assert.equal(0, poker.players[1].cash);

            poker.dealer(); // Init Stage
            poker.playerCall(poker.players[0]);
            poker.dealer(); // Next Player
            poker.playerCall(poker.players[1]);
            poker.dealer(); // Next Stage
            assert.equal(0, poker.players[0].cash);
            assert.equal(0, poker.players[1].cash);

            poker.dealer(); // Init Stage
            poker.playerCall(poker.players[0]);
            poker.dealer(); // Next Player
            poker.playerCall(poker.players[1]);
            poker.dealer(); // Next Stage
            assert.equal(0, poker.players[0].cash);
            assert.equal(0, poker.players[1].cash);

            poker.dealer(); // Init Stage
            poker.playerCall(poker.players[0]);
            poker.dealer(); // Next Player
            poker.playerCall(poker.players[1]);
            poker.dealer(); // Next Stage
            assert.equal(0, poker.players[0].cash);
            assert.equal(0, poker.players[1].cash);
            assert.equal(100, poker.players[0].potAmount);
            assert.equal(100, poker.players[1].potAmount);

            poker.dealt = new cardsApp.Cards(['AD', 'JD', '0D', '2H', '7C']);
            poker.dealer(); // Init stage
            poker.playerCall(poker.players[0]);
            poker.dealer(); // Next Player
            poker.playerCall(poker.players[1]);
            poker.dealer(); // Next Stage

            assert.equal(0,   poker.players[0].cash);
            assert.equal(200, poker.players[1].cash);
        })
    });

    describe('rewardWinners-2', function() {
        it('Should make player 0 and player 0 tie and both win 100', function() {
            let poker = new pokerApp.Poker();
            poker.addPlayer(0, {socketid: 'dummy0', money: 100});
            poker.addPlayer(1, {socketid: 'dummy1', money: 100});
            poker.dealer();
            poker.beforePlaying = false;
            poker.playing = true;

            poker.dealer(); // Init Stage
            assert.equal(0, poker.stage);
            poker.players[0].hand = new cardsApp.Cards(['AD', 'AH']);
            poker.players[1].hand = new cardsApp.Cards(['AC', 'AS']);
            poker.dealer(); // Next Stage

            poker.dealer(); // Init Stage
            poker.playerBet(poker.players[0], 100);
            poker.dealer(); // Next Player
            assert.equal(100, poker.players[1].cash);
            poker.playerCall(poker.players[1]);
            poker.dealer(); // Next Stage
            assert.equal(0, poker.players[0].cash);
            assert.equal(0, poker.players[1].cash);

            poker.dealer(); // Init Stage
            poker.playerCall(poker.players[0]);
            poker.dealer(); // Next Player
            poker.playerCall(poker.players[1]);
            poker.dealer(); // Next Stage
            assert.equal(0, poker.players[0].cash);
            assert.equal(0, poker.players[1].cash);

            poker.dealer(); // Init Stage
            poker.playerCall(poker.players[0]);
            poker.dealer(); // Next Player
            poker.playerCall(poker.players[1]);
            poker.dealer(); // Next Stage
            assert.equal(0, poker.players[0].cash);
            assert.equal(0, poker.players[1].cash);

            poker.dealer(); // Init Stage
            poker.playerCall(poker.players[0]);
            poker.dealer(); // Next Player
            poker.playerCall(poker.players[1]);
            poker.dealer(); // Next Stage
            assert.equal(0, poker.players[0].cash);
            assert.equal(0, poker.players[1].cash);
            assert.equal(100, poker.players[0].potAmount);
            assert.equal(100, poker.players[1].potAmount);

            poker.dealt = new cardsApp.Cards(['AD', 'JD', '0D', '2H', '7C']);
            poker.dealer(); // Init stage
            poker.playerCall(poker.players[0]);
            poker.dealer(); // Next Player
            poker.playerCall(poker.players[1]);
            poker.dealer(); // Next Stage

            assert.equal(100, poker.players[0].cash);
            assert.equal(100, poker.players[1].cash);
        })
    });
});