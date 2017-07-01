// const cardSymbolMap = {'AS': 'Ace of Spades', '2S': '2 of Spades', '3S': '3 of Spades', '4S': '4 of Spades', '5S': '5 of Spades', '6S': '6 of Spades', '7S': '7 of Spades', '8S': '8 of Spades', '9S': '9 of Spades', '0S': '10 of Spades', 'JS': 'Jack of Spades', 'QS': 'Queen of Spades', 'KS': 'King of Spades', 'AD': 'Ace of Diamonds', '2D': '2 of Diamonds', '3D': '3 of Diamonds', '4D': '4 of Diamonds', '5D': '5 of Diamonds', '6D': '6 of Diamonds', '7D': '7 of Diamonds', '8D': '8 of Diamonds', '9D': '9 of Diamonds', '0D': '10 of Diamonds', 'JD': 'Jack of Diamonds', 'QD': 'Queen of Diamonds', 'KD': 'King of Diamonds', 'AC': 'Ace of Clubs', '2C': '2 of Clubs', '3C': '3 of Clubs', '4C': '4 of Clubs', '5C': '5 of Clubs', '6C': '6 of Clubs', '7C': '7 of Clubs', '8C': '8 of Clubs', '9C': '9 of Clubs', '0C': '10 of Clubs', 'JC': 'Jack of Clubs', 'QC': 'Queen of Clubs', 'KC': 'King of Clubs', 'AH': 'Ace of Hearts', '2H': '2 of Hearts', '3H': '3 of Hearts', '4H': '4 of Hearts', '5H': '5 of Hearts', '6H': '6 of Hearts', '7H': '7 of Hearts', '8H': '8 of Hearts', '9H': '9 of Hearts', '0H': '10 of Hearts', 'JH': 'Jack of Hearts', 'QH': 'Queen of Hearts', 'KH': 'King of Hearts'};

export class Cards {
    static cardSymbolMap = {'AS': 'Ace of Spades', '2S': '2 of Spades', '3S': '3 of Spades', '4S': '4 of Spades', '5S': '5 of Spades', '6S': '6 of Spades', '7S': '7 of Spades', '8S': '8 of Spades', '9S': '9 of Spades', '0S': '10 of Spades', 'JS': 'Jack of Spades', 'QS': 'Queen of Spades', 'KS': 'King of Spades', 'AD': 'Ace of Diamonds', '2D': '2 of Diamonds', '3D': '3 of Diamonds', '4D': '4 of Diamonds', '5D': '5 of Diamonds', '6D': '6 of Diamonds', '7D': '7 of Diamonds', '8D': '8 of Diamonds', '9D': '9 of Diamonds', '0D': '10 of Diamonds', 'JD': 'Jack of Diamonds', 'QD': 'Queen of Diamonds', 'KD': 'King of Diamonds', 'AC': 'Ace of Clubs', '2C': '2 of Clubs', '3C': '3 of Clubs', '4C': '4 of Clubs', '5C': '5 of Clubs', '6C': '6 of Clubs', '7C': '7 of Clubs', '8C': '8 of Clubs', '9C': '9 of Clubs', '0C': '10 of Clubs', 'JC': 'Jack of Clubs', 'QC': 'Queen of Clubs', 'KC': 'King of Clubs', 'AH': 'Ace of Hearts', '2H': '2 of Hearts', '3H': '3 of Hearts', '4H': '4 of Hearts', '5H': '5 of Hearts', '6H': '6 of Hearts', '7H': '7 of Hearts', '8H': '8 of Hearts', '9H': '9 of Hearts', '0H': '10 of Hearts', 'JH': 'Jack of Hearts', 'QH': 'Queen of Hearts', 'KH': 'King of Hearts'};

    cardList: string[];

    constructor(cardList: string[] = []) {
        this.cardList = cardList;
    }

    getDeckSymbols() {
        return Object.keys(Cards.cardSymbolMap);
    }

    at(index: number): string {
        return this.cardList[index];
    }

    toString(): string {
        var ret = '';
        for (let i = 0; i < this.cardList.length; i++) {
            ret += this.cardList[i].toString();
            if (i != this.cardList.length - 1) {
                ret += ', ';
            }
        }

        return ret;
    }

    get length(): number {
        return this.cardList.length;
    }

    empty(): boolean{
        return this.cardList.length == 0;
    }

    clear(): void {
        this.cardList = [];
    }

    shuffle(): void {
        var j, x;
        for (let i = this.cardList.length; i; i--) {
            j = Math.floor(Math.random() * i);
            x = this.cardList[i - 1];
            this.cardList[i - 1] = this.cardList[j];
            this.cardList[j] = x;
        }
    }

    pop(): string {
        return this.cardList.pop();
    }

    add(card: string): void {
        if (card in Cards.cardSymbolMap) {
            this.cardList.push(card);
        }
    }

    addCards(cards: Cards): void {
        for (let card of cards.cardList) {
            this.add(card);
        }
    }

    getCardsArray(): string[] {
        return this.cardList;
    }
}

export class Deck extends Cards {
    constructor() {
        super(Object.keys(Cards.cardSymbolMap));
        this.shuffle();
    }
}
