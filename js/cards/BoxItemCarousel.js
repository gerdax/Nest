class BoxItemCarousel {
    constructor(container, boxCard, storyManager) {
        this.container = container;
        this.boxCard = boxCard;
        this.storyManager = storyManager;
        this.items = [];
        this.currentIndex = 0;
        this.isDragging = false;
        this.startX = 0;
        this.startY = 0;
        
        this.initializeBox();
    }

    initializeBox() {
        // Generate random number of items (1-3)
        const itemCount = Math.floor(Math.random() * 3) + 1;
        
        // Get all available item cards from story
        const availableItems = Array.from(this.storyManager.passages.values())
            .filter(card => card.cardType === 'item');
            
        // Randomly select items for the box
        for(let i = 0; i < itemCount; i++) {
            const randomItem = availableItems[Math.floor(Math.random() * availableItems.length)];
            this.items.push({
                ...randomItem,
                taken: false
            });
        }
    }

    setupCarousel() {
        this.container.innerHTML = '';
        
        const wrapper = document.createElement('div');
        wrapper.className = 'box-carousel-wrapper';
        
        const currentItem = this.items[this.currentIndex];
        if (!currentItem) return;

        const itemCard = document.createElement('div');
        itemCard.className = 'card main box-item';
        if (currentItem.image) {
            itemCard.style.backgroundImage = `url('${currentItem.image}')`;
        }

        // Add event listeners for box-specific interactions
        this.addCardInteractions(itemCard);
        
        wrapper.appendChild(itemCard);
        this.container.appendChild(wrapper);
        
        // Show item count indicator if more than one item
        if (this.items.length > 1) {
            this.showItemIndicator();
        }
    }

    addCardInteractions(card) {
        const handleStart = (e) => {
            this.isDragging = true;
            this.startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
            this.startY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
            card.style.transition = 'none';
        };

        const handleMove = (e) => {
            if (!this.isDragging) return;
            e.preventDefault();
            
            const currentX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
            const currentY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
            const deltaX = currentX - this.startX;
            const deltaY = currentY - this.startY;
            
            // Determine if movement is more horizontal or vertical
            if (Math.abs(deltaY) > Math.abs(deltaX)) {
                // Vertical movement
                card.style.transform = `translateY(${deltaY}px)`;
                card.style.opacity = 1 - Math.abs(deltaY) / 300;
            } else if (this.items.length > 1) {
                // Horizontal movement (only if multiple items)
                card.style.transform = `translateX(${deltaX}px)`;
            }
        };

        const handleEnd = (e) => {
            if (!this.isDragging) return;
            this.isDragging = false;
            
            const currentX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
            const currentY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
            const deltaX = currentX - this.startX;
            const deltaY = currentY - this.startY;
            
            if (Math.abs(deltaY) > 100) {
                if (deltaY > 0) {
                    this.closeBox();
                } else {
                    this.takeItem();
                }
            } else if (Math.abs(deltaX) > 50 && this.items.length > 1) {
                this.navigateCarousel(deltaX > 0 ? -1 : 1);
            } else {
                this.resetCard(card);
            }
        };

        card.addEventListener('mousedown', handleStart);
        card.addEventListener('touchstart', handleStart);
        document.addEventListener('mousemove', handleMove);
        document.addEventListener('touchmove', handleMove, { passive: false });
        document.addEventListener('mouseup', handleEnd);
        document.addEventListener('touchend', handleEnd);
    }

    navigateCarousel(direction) {
        this.currentIndex = (this.currentIndex + direction + this.items.length) % this.items.length;
        this.setupCarousel();
    }

    takeItem() {
        this.items[this.currentIndex].taken = true;
        const remainingItems = this.items.filter(item => !item.taken);
        
        if (remainingItems.length === 0) {
            this.boxCard.isEmpty = true;
            this.returnToBox();
        } else {
            this.items = remainingItems;
            this.currentIndex = 0;
            this.setupCarousel();
        }
    }

    closeBox() {
        this.returnToBox();
    }

    returnToBox() {
        // Return to the box card view
        window.setupCards(this.boxCard.id);
    }

    resetCard(card) {
        card.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
        card.style.transform = 'none';
        card.style.opacity = '1';
    }

    showItemIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'box-item-indicator';
        indicator.textContent = `Item ${this.currentIndex + 1} of ${this.items.length}`;
        this.container.appendChild(indicator);
    }
}