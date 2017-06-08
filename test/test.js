var assert = require('assert');
var PokerEvaluator = require("poker-evaluator");

let pokerApp = require(__dirname + '/../public/js/poker.js');
// let subsets = pokerApp.subsets;
let Poker = pokerApp.Poker;
// let cardList = Object.keys(pokerApp.cardSymbolMap);

describe('HandRank', function() {
    describe("['AS', 'KS', 'JS', '0S', 'QS', '2C', '3C']", function() {
        it('Should be a Royal Flush (Rank 9)', function() {
            var rank = new pokerApp.HandRank(['AS', 'KS', 'JS', '0S', 'QS', '2C', '3C']).rank;
            assert.equal(rank.rank, 9);
        });
    });
});

describe('Poker', function () {
   describe("Stages", function () {
       it('Should be in PreFlop Stage', function () {
           let poker = new Poker();
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