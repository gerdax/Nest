// js/main.js
let currentCardManager = null;

window.setupCards = function(cardId) {
    const container = document.getElementById('card-container');
    if (!container) return;
    
    if (currentCardManager) {
        currentCardManager.cleanup();
    }
    
    container.innerHTML = '';
    
    const passage = window.storyManager.getPassage(cardId);
    if (!passage) return;
    
    const bottomImage = document.createElement('div');
    bottomImage.id = 'bottom-image';
    bottomImage.style.backgroundImage = `url('img/UI.png')`;
    container.appendChild(bottomImage);
    
    const passageText = document.createElement('div');
    passageText.id = 'passage-text';
    passageText.textContent = passage.text;
    container.appendChild(passageText);
    
    const wrapper = document.createElement('div');
    wrapper.className = 'card-wrapper';
    
    const ghostCard = document.createElement('div');
    ghostCard.className = 'card ghost';
    if (passage.image) {
        ghostCard.style.backgroundImage = `url('${passage.image}')`;
    }
    wrapper.appendChild(ghostCard);
    
    const mainCard = document.createElement('div');
    mainCard.className = 'card main';
    if (passage.image) {
        mainCard.style.backgroundImage = `url('${passage.image}')`;
    }
    
    const choiceText = document.createElement('div');
    choiceText.className = 'choice-text';
    mainCard.appendChild(choiceText);
    
    wrapper.appendChild(mainCard);
    container.appendChild(wrapper);
    
    currentCardManager = new CardManager(mainCard, ghostCard, passageText, passage, window.storyManager);
    currentCardManager.initialize();
};

// Initialize game
async function initGame() {
    await window.storyManager.loadXLSXStory();
    const container = document.getElementById('card-container');
    if (container) {
        container.classList.add('active');
    }
    setupCards(window.storyManager.getStartPassage());
}

// Start the game
initGame().catch(console.error);