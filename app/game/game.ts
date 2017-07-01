import {Cards} from "./cards";

export class Player {
    cash: number = 0;
    hand: Cards = new Cards();
    potAmount: number = 0;
    folded: boolean = true;
    seated: boolean = false;
    leaving: boolean = false;
    playerInfo = {
        'socketid': null,
    };

    private state = {
        turn: 0,
        action: [null, null],
        cash: 0,
    };

    private personalState = {
        hand: []
    };

    constructor(money) {
        this.cash = money;
    }

    public sitToggle() {
        this.seated = !this.seated;
    }

    public isSeated() {
        return this.seated;
    }

    public isLeaving() {
        return this.leaving;
    }
      

    public stateHasChanged = true;

    call(amount) {
        if (amount) {
            this.potAmount += amount;
            this.cash -= amount;
        }
        this.state.action = [1, amount];
        this.stateHasChanged = true;
    }

    bet(amount) {
        this.potAmount += amount;
        this.cash -= amount;
        console.log('cash: ' + this.cash);
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
        this.potAmount = 0;
        this.folded = false;
        this.state.action = null;
        if (deck != null) {
            deck.addCards(this.hand);
        }
        this.hand.clear();
        this.stateHasChanged = true;
    }

    resetTurn() {
        this.state.action = null;
        this.stateHasChanged = true;
    }

    has(amount) {
        return amount >= 0 && amount <= this.cash;
    }

    get(key) {
        // console.log(this.potAmount);
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
        // console.log(this.cash);
        this.state['cash'] = this.cash;
        // this.state['minimumBet'] = this.playerInfo['minimumBet'];
        // console.log(this.state);
        this.stateHasChanged = false;
        return this.state;
    }

    getPersonalState() {

    }

    addMoney(money) {
        this.cash += money;
    }
}

export class Game {
    protected turnNumber = 0;
    protected players: Player[] = [];
    protected state = {};
    protected stateChanged: boolean = false;
    protected stateChanges = [];
    private messages = [];

    // public getState() {
    //
    //     for (let i = 0; i < this.players.length; i++) {
    //         if (this.players[i] != null && this.players[i].stateHasChanged) {
    //             this.updateState('players.' + i, this.players[i].getState());
    //         }
    //     }
    //
    //     this.stateChanges = [];
    //
    //     return this.state;
    // }

    public getStateChanges() {
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i] != null && this.players[i].stateHasChanged) {
                this.updateState('players.' + i, this.players[i].getState());
            }
        }
        let changes = this.stateChanges;
        this.stateChanged = false;
        this.stateChanges = [];
        return changes;
    }

    public hasNewState() {
        return this.stateChanged;
    }

    public hasMessages() {
        return this.messages.length > 0;
    }

    public getMessages() {
        return this.messages;
    }

    public clearMessages() {
        this.messages = [];
    }

    public addMessage(message) {
        this.messages.push(message);
    }

    public updateState(key, value) {
        console.log('updating ' + key);
        if (!key) return;

        let keys = key.split('.');
        if (keys.length != 0) {
            let object = this.state;
            for (let i = 0; i < keys.length; i++) {
                if (i == keys.length - 1) {
                    object[keys[i]] = value;
                }

                else if (object[keys[i]] == null) {
                    object[keys[i]] = {};
                }

                object = object[keys[i]];
            }
        }

        this.stateChanges.push([key, value]);
        this.stateChanged = true;
    }

    public getState(key) {
        if (!key) return;

        let keys = key.split('.');
        if (keys.length != 0) {
            let object = this.state;
            for (let i = 0; i < keys.length; i++) {
                if (object[keys[i]] == null) {
                    return null;
                }

                else if (i == keys.length - 1) {
                    return object[keys[i]];
                }

                object = object[keys[i]];
            }
        }

        return null;
    }
}