var assert = require('assert');
var PokerEvaluator = require("poker-evaluator");

let gameApp = require(__dirname + '/../app/game/game.js');
let pokerApp = require(__dirname + '/../app/game/poker.js');
// let subsets = pokerApp.subsets;
// let cardList = Object.keys(pokerApp.cardSymbolMap);

// describe('HandRank', function() {
//     describe("['AS', 'KS', 'JS', '0S', 'QS', '2C', '3C']", function() {
//         it('Should be a Royal Flush (Rank 9)', function() {
//             var rank = new pokerApp.HandRank(['AS', 'KS', 'JS', '0S', 'QS', '2C', '3C']).rank;
//             assert.equal(rank.rank, 9);
//         });
//     });
// });

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

describe('Poker', function () {
   describe("Stages", function () {
       it('Should be in PreFlop Stage', function () {
           let poker = new pokerApp.Poker();
           poker.addPlayer(0, {socketid: 'dummy0', money: 100});
           poker.addPlayer(1, {socketid: 'dummy1', money: 120});
           poker.dealer();
           assert.equal(0, poker.stage);

           poker.players[0].call();
           poker.players[1].call();
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
   })
});