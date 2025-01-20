// js/cards/BoxCard.js
class BoxCard extends BaseCard {
    constructor(data) {
        super(data);
        this.isLocked = this.subType === 'locked';
    }

    getNextCardTypes(direction) {
        if (this.isLocked) {
            if (direction === 'left') {
                return ['spatial'];
            } else if (direction === 'right') {
                return ['item'];
            }
        } else {
            if (direction === 'left') {
                return ['spatial'];
            } else if (direction === 'right') {
                return ['item'];
            }
        }
        return [];
    }

    // onAction() {
    //     if (this.isLocked) {
    //         console.log('This box is locked');
    //         return false;
    //     }
    //     return true;
    // }
}