'use strict';

const cardSymbolMap = {'AS': 'Ace of Spades', '2S': '2 of Spades', '3S': '3 of Spades', '4S': '4 of Spades', '5S': '5 of Spades', '6S': '6 of Spades', '7S': '7 of Spades', '8S': '8 of Spades', '9S': '9 of Spades', '0S': '10 of Spades', 'JS': 'Jack of Spades', 'QS': 'Queen of Spades', 'KS': 'King of Spades', 'AD': 'Ace of Diamonds', '2D': '2 of Diamonds', '3D': '3 of Diamonds', '4D': '4 of Diamonds', '5D': '5 of Diamonds', '6D': '6 of Diamonds', '7D': '7 of Diamonds', '8D': '8 of Diamonds', '9D': '9 of Diamonds', '0D': '10 of Diamonds', 'JD': 'Jack of Diamonds', 'QD': 'Queen of Diamonds', 'KD': 'King of Diamonds', 'AC': 'Ace of Clubs', '2C': '2 of Clubs', '3C': '3 of Clubs', '4C': '4 of Clubs', '5C': '5 of Clubs', '6C': '6 of Clubs', '7C': '7 of Clubs', '8C': '8 of Clubs', '9C': '9 of Clubs', '0C': '10 of Clubs', 'JC': 'Jack of Clubs', 'QC': 'Queen of Clubs', 'KC': 'King of Clubs', 'AH': 'Ace of Hearts', '2H': '2 of Hearts', '3H': '3 of Hearts', '4H': '4 of Hearts', '5H': '5 of Hearts', '6H': '6 of Hearts', '7H': '7 of Hearts', '8H': '8 of Hearts', '9H': '9 of Hearts', '0H': '10 of Hearts', 'JH': 'Jack of Hearts', 'QH': 'Queen of Hearts', 'KH': 'King of Hearts'};

class Card {
    constructor(key) {
        if (key != null && typeof cardSymbolMap[key] != "undefined") {
            this.key = key;
        } else if (key == null) {
            console.error("card key was null");
        } else {
            console.error("card key was " + key);
        }
    }

    static get CardMap() {
        return cardSymbolMap;
    }

    toString() {
        return cardSymbolMap[this.key]
    }

    get index() {
        var cardNum = this.key.charAt(0);
        switch(cardNum) {
            case 'A':
                return [1, 14];
            case '2':
                return [2];
            case '3':
                return [3];
            case '4':
                return [4];
            case '5':
                return [5];
            case '6':
                return [6];
            case '7':
                return [7];
            case '8':
                return [8];
            case '9':
                return [9];
            case '0':
                return [10];
            case 'J':
                return [11];
            case 'Q':
                return [12];
            case 'K':
                return [13];

        }
    }

    static symbolWithIndex(index) {
        switch(index) {
            case 1:
            case 14:
                return '1';
            case 2:
                return '2';
            case 3:
                return '3';
            case 4:
                return '4';
            case 5:
                return '5';
            case 6:
                return '6';
            case 7:
                return '7';
            case 8:
                return '8';
            case 9:
                return '9';
            case 10:
                return '0';
            case 11:
                return '11';
            case 12:
                return '12';
            case 13:
                return 'K';

        }
    }

    get suit() {
        var cardSuit = this.key.charAt(1);
        switch(cardSuit) {
            case 'S':
                return 'Spades';
            case 'D':
                return 'Diamonds';
            case 'C':
                return 'Clubs';
            case 'H':
                return 'Hearts';
        }
    }

    symbol() {
        return this.key;
    }
}

class Cards {
    constructor(cardList) {
        // this.cardsArray = cardList || Object.keys(cardSymbolMap);
        // console.log(cardList);
        this.cardsArray = [];
        if (cardList == null) {
            var cardKeys = Object.keys(cardSymbolMap);
            for (let i = 0; i < cardKeys.length; i++) {
                this.cardsArray.push(new Card(cardKeys[i]));
            }
        } else {
            this.cardsArray = cardList;
        }
    }

    toString() {
        var ret = '';
        for (var i in this.cardsArray) {
            // console.log(c);
            ret += this.cardsArray[i].toString();
            if (i != this.cardsArray.length - 1) {
                ret += ', ';
            }
        }

        return ret;
    }

    shuffle() {
        var j, x;
        for (let i = this.cardsArray.length; i; i--) {
            j = Math.floor(Math.random() * i);
            x = this.cardsArray[i - 1];
            this.cardsArray[i - 1] = this.cardsArray[j];
            this.cardsArray[j] = x;
        }
    }

    sort() {
        this.cardsArray.sort(function(a, b) {
            console.log(a.key);
            var x =  a.index[0];
            console.log(x);
            var y = b.index[0];
            if (x < y) {
                return -1;
            } else if (x > y) {
                return 1;
            }

            return 0;
        });
    }

    pop() {
        return this.cardsArray.pop();
    }

    add(card) {
        this.cardsArray.push(card);
    }

    length() {
        return this.cardsArray.length;
    }

    at(index) {
        return this.cardsArray[index];
    }
}

class Hand extends Cards {
    constructor(cardList, deck, player) {
        super(cardList);
        this.deck = deck;
        this.player = player;
    }

    back() {
        for (let i = 0; i < this.cardsArray.length; i++) {
            this.deck.add(this.cardsArray[i]);
        }
    }

    addHand(otherHand) {
        for (let i = 0; i < otherHand.cardsArray.length; i++) {

        }
    }

    addCard(otherCard) {
    }
}

class Deck extends Cards {
    constructor(deckType = 'Poker', includeJoker = false) {
        //TODO Do something with includeJoker variable.
        super();
        this.cardMap = {};
        this.deckType = deckType;
        for (let i = 0; i < this.cardsArray.length; i++) {
            this.cardMap[this.cardsArray[i].key] = this.cardsArray[i];
        }

        this.shuffle();
    }

    deal(count) {
        var tempHand = [];
        for (let i = 0; i < count; i++) {
            var card = this.cardsArray.pop();
            console.log(card);
            tempHand.push(card);
        }

        if (this.deckType == 'Poker') {
            return new Hand(tempHand, this);
        } else {
            // TODO
        }
    }

    get AceOfSpades() {return this.cardMap['AS'];}
    get TwoOfSpades() {return this.cardMap['2S'];}
    get ThreeOfSpades() {return this.cardMap['3S'];}
    get FourOfSpades() {return this.cardMap['4S'];}
    get FiveOfSpades() {return this.cardMap['5S'];}
    get SixOfSpades() {return this.cardMap['6S'];}
    get SevenOfSpades() {return this.cardMap['7S'];}
    get EightOfSpades() {return this.cardMap['8S'];}
    get NineOfSpades() {return this.cardMap['9S'];}
    get TenOfSpades() {return this.cardMap['0S'];}
    get JackOfSpades() {return this.cardMap['JS'];}
    get QueenOfSpades() {return this.cardMap['QS'];}
    get KingOfSpades() {return this.cardMap['KS'];}

    get AceOfDiamonds() {return this.cardMap['AD'];}
    get TwoOfDiamonds() {return this.cardMap['2D'];}
    get ThreeOfDiamonds() {return this.cardMap['3D'];}
    get FourOfDiamonds() {return this.cardMap['4D'];}
    get FiveOfDiamonds() {return this.cardMap['5D'];}
    get SixOfDiamonds() {return this.cardMap['6D'];}
    get SevenOfDiamonds() {return this.cardMap['7D'];}
    get EightOfDiamonds() {return this.cardMap['8D'];}
    get NineOfDiamonds() {return this.cardMap['9D'];}
    get TenOfDiamonds() {return this.cardMap['0D'];}
    get JackOfDiamonds() {return this.cardMap['JD'];}
    get QueenOfDiamonds() {return this.cardMap['QD'];}
    get KingOfDiamonds() {return this.cardMap['KD'];}

    get AceOfClubs() {return this.cardMap['AC'];}
    get TwoOfClubs() {return this.cardMap['2C'];}
    get ThreeOfClubs() {return this.cardMap['3C'];}
    get FourOfClubs() {return this.cardMap['4C'];}
    get FiveOfClubs() {return this.cardMap['5C'];}
    get SixOfClubs() {return this.cardMap['6C'];}
    get SevenOfClubs() {return this.cardMap['7C'];}
    get EightOfClubs() {return this.cardMap['8C'];}
    get NineOfClubs() {return this.cardMap['9C'];}
    get TenOfClubs() {return this.cardMap['0C'];}
    get JackOfClubs() {return this.cardMap['JC'];}
    get QueenOfClubs() {return this.cardMap['QC'];}
    get KingOfClubs() {return this.cardMap['KC'];}

    get AceOfHearts() {return this.cardMap['AH'];}
    get TwoOfHearts() {return this.cardMap['2H'];}
    get ThreeOfHearts() {return this.cardMap['3H'];}
    get FourOfHearts() {return this.cardMap['4H'];}
    get FiveOfHearts() {return this.cardMap['5H'];}
    get SixOfHearts() {return this.cardMap['6H'];}
    get SevenOfHearts() {return this.cardMap['7H'];}
    get EightOfHearts() {return this.cardMap['8H'];}
    get NineOfHearts() {return this.cardMap['9H'];}
    get TenOfHearts() {return this.cardMap['0H'];}
    get JackOfHearts() {return this.cardMap['JH'];}
    get QueenOfHearts() {return this.cardMap['QH'];}
    get KingOfHearts() {return this.cardMap['KH'];}
}