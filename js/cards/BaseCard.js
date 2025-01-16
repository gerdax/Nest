// js/cards/BaseCard.js
class BaseCard {
    constructor(data) {
        this.id = data.cardId;
        this.cardType = data.cardType;
        this.subType = data.subType;
        this.text = data.mainText;
        this.image = data.backgroundImage;
        this.leftChoice = data.leftChoiceText;
        this.rightChoice = data.rightChoiceText;
    }

    getNextCardTypes() {
        return [];
    }
    logCardDetails() {
        console.log(`Card Type: ${this.cardType}, Subtype: ${this.subType}, Name: ${this.id}`);
    }
    onAction() {
       // baseCard.logCardDetails(); // Logs: Card Type: base, Subtype: example
    }


}