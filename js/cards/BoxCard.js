// js/cards/BoxCard.js
class BoxCard extends BaseCard {
    constructor(data) {
        super(data);
        this.isLocked = this.subType === 'locked';
        this.isEmpty = false;
        this.hasBeenOpened = false;
    }

    getNextCardTypes(direction) {
        if (this.isEmpty) {
            return ['spatial']; // Can only leave if box is empty
        }
        
        if (direction === 'left' && !this.hasBeenOpened) {
            this.hasBeenOpened = true;
            return ['box-items']; // Special type to trigger carousel
        }
        
        return ['spatial'];
    }
}