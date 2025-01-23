// js/cards/BoxCard.js
class BoxCard extends BaseCard {
    constructor(data) {
        super(data);
        this.isLocked = this.subType === 'locked';
        this.isEmpty = false;
        this.hasBeenOpened = false;
        console.log(`Box card created: ${this.id} from BoxCard constructor`);
        console.log(this.isEmpty)
    }

    resetBoxState() {
        this.hasBeenOpened = false;
        this.isEmpty = false;
        console.log(`Reset BOX STATE for ${this.id}`);
    }

    getNextCardTypes(direction) {
        if (this.isEmpty) {
            return ['spatial'];

        }
        
        if (direction === 'right' && !this.hasBeenOpened) {
            this.hasBeenOpened = true;
            return ['box-items'];
        }
        
        return ['spatial'];
    }
}