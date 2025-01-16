// CardManager.js
class CardManager {
    constructor(mainCard, ghostCard, passageText, passage, storyManager) {
        this.mainCard = mainCard;
        this.ghostCard = ghostCard;
        this.passageText = passageText;
        this.passage = passage;
        this.storyManager = storyManager;
        this.isDragging = false;
        this.startX = 0;
        
        this.handleStart = this.handleStart.bind(this);
        this.handleMove = this.handleMove.bind(this);
        this.handleEnd = this.handleEnd.bind(this);
    }
    
    initialize() {
        this.mainCard.addEventListener('mousedown', this.handleStart);
        document.addEventListener('mousemove', this.handleMove);
        document.addEventListener('mouseup', this.handleEnd);
        
        this.mainCard.addEventListener('touchstart', this.handleStart);
        document.addEventListener('touchmove', this.handleMove, { passive: false });
        document.addEventListener('touchend', this.handleEnd);
    }
    
    cleanup() {
        this.mainCard.removeEventListener('mousedown', this.handleStart);
        document.removeEventListener('mousemove', this.handleMove);
        document.removeEventListener('mouseup', this.handleEnd);
        
        this.mainCard.removeEventListener('touchstart', this.handleStart);
        document.removeEventListener('touchmove', this.handleMove);
        document.removeEventListener('touchend', this.handleEnd);
    }
    
    handleStart(e) {
        e.preventDefault();
        this.isDragging = true;
        this.startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        this.mainCard.style.transition = 'none';
    }
    
    handleMove(e) {
        if (!this.isDragging) return;
        e.preventDefault();
        
        const currentX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        let deltaX = currentX - this.startX;
        const maxDragDistance = 100;
        
        deltaX = Math.max(Math.min(deltaX, maxDragDistance), -maxDragDistance);
        const rotation = deltaX * 0.1;
        const absDeltaX = Math.abs(deltaX);
        const scaleFactor = 100 + Math.min(absDeltaX / 5, 10);

        this.mainCard.style.transform = `translateX(${deltaX}px) rotate(${rotation}deg)`;
        this.mainCard.style.backgroundSize = `${scaleFactor}%`;

        const totalProgress = Math.min(absDeltaX / maxDragDistance, 1);
        
        if (absDeltaX > 0) {
            const scale = 0.85 + ((Math.min(absDeltaX / 100, 1)) * 0.15);
            this.ghostCard.style.opacity = totalProgress * 0.7;
            this.ghostCard.style.transform = `scale(${scale})`;

            const choiceText = this.mainCard.querySelector('.choice-text');
            if (deltaX < 0) {
                choiceText.textContent = this.passage.leftChoice;
                choiceText.style.opacity = totalProgress;
            } else {
                choiceText.textContent = this.passage.rightChoice;
                choiceText.style.opacity = totalProgress;
            }
        } else {
            this.ghostCard.style.opacity = '0';
            const choiceText = this.mainCard.querySelector('.choice-text');
            choiceText.style.opacity = '0';
        }
    }
    
    handleEnd(e) {
        if (!this.isDragging) return;
        this.isDragging = false;
        
        const currentX = e.type.includes('mouse') ? e.clientX : e.changedTouches[0].clientX;
        const deltaX = currentX - this.startX;
    
        if (Math.abs(deltaX) > 50) {
            const direction = deltaX > 0 ? 'right' : 'left';
            const nextCard = this.storyManager.getNextCard(this.passage, direction);
            
            if (nextCard) {
                this.transitionToChoice(nextCard, direction);
            } else {
                this.resetCard();
            }
        } else {
            this.resetCard();
        }
    }
        
    resetCard() {
        this.mainCard.style.transition = 'transform 0.3s ease, background-size 0.3s ease, background-position 0.3s ease';
        this.mainCard.style.transform = 'none';
        this.mainCard.style.backgroundSize = '100%';
        this.mainCard.style.backgroundPosition = '50% center';
        this.mainCard.style.opacity = '1';

        this.ghostCard.style.opacity = '0';
        const choiceText = this.mainCard.querySelector('.choice-text');
        choiceText.style.opacity = '0';
    }
    
    transitionToChoice(nextCard, direction) {
        if (nextCard.image) {
            this.ghostCard.style.backgroundImage = `url('${nextCard.image}')`;
        }
    
        this.mainCard.style.transition = 'all 0.3s ease';
        const multiplier = direction === 'right' ? 1 : -1;
        this.mainCard.style.transform = `translateX(${multiplier * window.innerWidth}px) rotate(${multiplier * 30}deg)`;
        this.mainCard.style.opacity = '0';
    
        this.ghostCard.style.transition = 'transform 0.4s ease, opacity 0.4s ease, background-color 0.4s ease';
        this.ghostCard.style.opacity = '1';
        this.ghostCard.style.transform = 'scale(1)';
        this.ghostCard.classList.add('transitioning');
    
        setTimeout(() => {
            window.setupCards(nextCard.id);
            nextCard.logCardDetails(); // Logs: Card Type and Subtype of the next card
        }, 400);
    }}