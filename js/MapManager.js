class MapManager {
    constructor() {
        this.reset();
    }

    reset(startCard = null) {
        this.nodes = [];
        this.currentNode = null;
        this.lastSpatialNode = null;

        if (startCard) {
            this.addStartNode(startCard);
        }
    }

    addStartNode(card) {
        const node = this.createNode(card, 0, 0);
        this.nodes.push(node);
        this.currentNode = node;
        this.lastSpatialNode = node;
    }

    advance(card, direction) {
        if (!card || card.cardType !== 'spatial') return;

        if (!this.lastSpatialNode) {
            this.addStartNode(card);
            return;
        }

        const sign = direction === 'left' ? -1 : 1;
        const verticalStep = this.verticalStep(card.id);
        const x = this.lastSpatialNode.x + sign;
        const y = this.lastSpatialNode.y + verticalStep;
        const existing = this.nodes.find(node => node.x === x && node.y === y);
        const node = existing || this.createNode(card, x, y);

        if (!existing) {
            this.nodes.push(node);
        }

        this.lastSpatialNode.links.add(node.id);
        node.links.add(this.lastSpatialNode.id);
        this.currentNode = node;
        this.lastSpatialNode = node;
    }

    createNode(card, x, y) {
        return {
            id: `${card.id}-${x}-${y}`,
            cardId: card.id,
            label: this.labelFor(card),
            x,
            y,
            links: new Set()
        };
    }

    verticalStep(cardId) {
        const sum = [...cardId].reduce((total, character) => total + character.charCodeAt(0), 0);
        return sum % 3 === 0 ? 1 : sum % 3 === 1 ? -1 : 0;
    }

    labelFor(card) {
        if (card.subType === 'fork') return 'JUNCTION';
        return card.id.replace(/([A-Z])/g, ' $1').trim().toUpperCase();
    }

    render(container) {
        if (!this.currentNode || !container) return;

        const mapCard = document.createElement('aside');
        mapCard.className = 'map-card';
        mapCard.setAttribute('aria-label', 'Discovered map');

        const title = document.createElement('div');
        title.className = 'map-card-title';
        title.textContent = 'FIELD MAP';
        mapCard.appendChild(title);

        const viewport = document.createElement('div');
        viewport.className = 'map-viewport';
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.classList.add('map-lines');
        svg.setAttribute('viewBox', '0 0 100 70');

        const positions = new Map(this.nodes.map(node => [node.id, this.positionFor(node)]));
        this.nodes.forEach(node => {
            node.links.forEach(linkId => {
                if (node.id > linkId) return;
                const target = positions.get(linkId);
                const source = positions.get(node.id);
                if (!target || !source) return;
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', source.x);
                line.setAttribute('y1', source.y);
                line.setAttribute('x2', target.x);
                line.setAttribute('y2', target.y);
                svg.appendChild(line);
            });
        });
        viewport.appendChild(svg);

        this.nodes.forEach(node => {
            const position = positions.get(node.id);
            const marker = document.createElement('div');
            marker.className = `map-node${node === this.currentNode ? ' current' : ''}`;
            marker.style.left = `${position.x}%`;
            marker.style.top = `${position.y}%`;
            marker.title = node.label;
            marker.setAttribute('aria-label', node === this.currentNode ? `Current location: ${node.label}` : node.label);
            viewport.appendChild(marker);
        });

        mapCard.appendChild(viewport);
        const location = document.createElement('div');
        location.className = 'map-location';
        location.textContent = `YOU ARE HERE · ${this.currentNode.label}`;
        mapCard.appendChild(location);
        container.appendChild(mapCard);
    }

    positionFor(node) {
        const x = 50 + (node.x - this.currentNode.x) * 22;
        const y = 35 + (node.y - this.currentNode.y) * 16;
        return { x: Math.max(8, Math.min(92, x)), y: Math.max(10, Math.min(60, y)) };
    }
}

window.mapManager = new MapManager();
