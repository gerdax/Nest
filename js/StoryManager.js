// js/StoryManager.js
class StoryManager {
    constructor() {
        this.passages = new Map();
        this.cardTypes = {
            'spatial': SpatialCard,
            'box': BoxCard,
            'item': ItemCard
        };
    }

    async loadXLSXStory() {
        try {
            const response = await fetch('story.xlsx');
            const arrayBuffer = await response.arrayBuffer();
            const data = new Uint8Array(arrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(firstSheet);
            
            this.passages.clear();
            
            rows.forEach(row => {
                const CardClass = this.cardTypes[row.cardType];
                if (CardClass) {
                    const card = new CardClass(row);
                    this.passages.set(row.passageId, card);
                }
            });

            if (rows.length > 0) {
                this.startPassage = rows[0].passageId;
            }
        } catch (error) {
            console.error('Error loading story:', error);
        }
    }

    getNextCard(currentCard, direction) {
        const possibleTypes = currentCard.getNextCardTypes();
        const possibleCards = Array.from(this.passages.values())
            .filter(card => possibleTypes.includes(card.cardType));
        return possibleCards[Math.floor(Math.random() * possibleCards.length)];
    }

    getPassage(passageId) {
        return this.passages.get(passageId);
    }

    getStartPassage() {
        return this.startPassage;
    }
}

window.storyManager = new StoryManager();