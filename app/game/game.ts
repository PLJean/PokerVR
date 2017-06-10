import {Cards} from "./cards";

export class Player {
    cash: number = 0;
    hand: Cards = new Cards();
    betAmount: number = 0;
    folded: boolean = true;
    playerInfo = {
        'socketid': null
    };

    private state = {
        turn: 0,
        action: [null, null],
        cash: 0,
    };

    public stateHasChanged = true;

    constructor(money) {
        this.cash = money;
    }

    call() {
        this.state.action = [1, null];
        this.stateHasChanged = true;
    }

    bet(amount) {
        this.betAmount += amount;
        this.state.action =  [2, amount];
        this.stateHasChanged = true;
    }

    fold(): void {
        this.folded = true;
        this.state.action = [3, null];
        this.stateHasChanged = true;
    }

    isDone(): boolean {
        if (this.state.action) {
            return true;
        }

        return false;
    }

    isFolded(): boolean {
        return this.folded;
    }

    getHand() {
        return this.hand;
    }

    reset(deck: Cards) {
        this.betAmount = 0;
        this.folded = false;
        this.state.action = null;
        this.hand.clear();
        if (deck != null) {
            deck.addCards(this.hand);
        }
        this.stateHasChanged = true;
    }

    resetTurn() {
        this.betAmount = 0;
        this.folded = false;
        this.state.action = null;
        this.stateHasChanged = true;
    }

    has(amount) {
        return amount >= 0 && amount < this.cash;
    }

    get(key) {
        // console.log(this.betAmount);
        // console.log(this.playerInfo);
        if (this.playerInfo.hasOwnProperty(key)) {
            return this.playerInfo[key];
        }

        return null;
    }

    set(key, value) {
        this.playerInfo[key] = value;
    }

    getState() {
        console.log(this.cash);
        this.state.cash = this.cash;
        console.log(this.state);
        this.stateHasChanged = false;
        return this.state;
    }

    addMoney(money) {
        this.cash += money;
    }
}

export class Game {
    protected players: Player[] = [];
    protected state = {};
    protected stateChanged: boolean = false;

    public getState() {
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i] != null && this.players[i].stateHasChanged) {
                this.updateState('players.' + i, this.players[i].getState());
            }
        }

        this.stateChanged = false;

        return this.state;
    }

    public hasNewState() {
        return this.stateChanged;
    }

    public updateState(key, value) {
        if (!key) return;

        let keys = key.split('.');
        if (keys.length != 0) {
            let object = this.state;
            for (let i = 0; i < keys.length - 1; i++) {
                object = object[keys[i]];
            }

            if (value != null) {
                object[keys[keys.length - 1]] = value;
            } else {
                delete object[keys[keys.length - 1]];
            }
        }

        this.stateChanged = true;
    }

    public apply(method, args) {
        console.log(this);
    }
}