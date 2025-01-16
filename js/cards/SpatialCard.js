// js/cards/SpatialCard.js
class SpatialCard extends BaseCard {
    constructor(data) {
        super(data);
    }

    getNextCardTypes() {
        switch(this.subType) {
            case 'fork':
                return ['spatial', 'box'];
            case 'road':
                return ['spatial', 'box', 'item'];
            default:
                return ['spatial'];
        }
    }
}