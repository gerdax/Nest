// js/cards/BoxCard.js
class BoxCard extends BaseCard {
    constructor(data) {
        super(data);
        this.isLocked = this.subType === 'locked';
    }

    getNextCardTypes() {
        if (this.subType === 'locked') {
            return ['spatial'];
        }
        return ['item', 'spatial'];
    }

    onAction() {
        if (this.isLocked) {
            console.log('This box is locked');
            return false;
        }
        return true;
    }
}