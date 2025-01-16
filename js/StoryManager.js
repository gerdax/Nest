class StoryManager {
    constructor() {
        this.passages = new Map();
        this.lastShownCardId = null; // Property to track the last shown card ID
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
                    this.passages.set(row.cardId, card);
                }
            });

            if (rows.length > 0) {
                this.startPassage = rows[0].cardId;
            }
        } catch (error) {
            console.error('Error loading story:', error);
        }
    }

    getNextCard(currentCard, direction) {
        const possibleTypes = currentCard.getNextCardTypes(direction);
        const possibleCards = Array.from(this.passages.values())
            .filter(card => possibleTypes.includes(card.cardType) && card.id !== this.lastShownCardId);
        
        if (possibleCards.length === 0) {
            return null; // No more cards available
        }

        const nextCard = possibleCards[Math.floor(Math.random() * possibleCards.length)];
        this.lastShownCardId = nextCard.id; // Update the last shown card ID
        return nextCard;
    }

    getPassage(cardId) {
        return this.passages.get(cardId);
    }

    getStartPassage() {
        return this.startPassage;
    }
}

window.storyManager = new StoryManager();