// Memory Game Component
AFRAME.registerComponent('memory-game', {
    init: function() {
        this.cards = [];
        this.flippedCards = [];
        this.pairsFound = 0;
        this.totalPairs = 8;
        this.canFlip = true;
        
        // Cores para usar como valores das cartas em vez de emojis
        this.cardColors = [
            '#FF5733', '#FF5733', '#33FF57', '#33FF57', '#3357FF', '#3357FF', '#FF33F5', '#FF33F5',
            '#F5FF33', '#F5FF33', '#33FFF5', '#33FFF5', '#FF8C33', '#FF8C33', '#8C33FF', '#8C33FF'
        ];

        // Formas para usar como valores das cartas
        this.cardShapes = [
            'circle', 'circle', 'triangle', 'triangle', 'square', 'square', 'ring', 'ring',
            'torus', 'torus', 'cone', 'cone', 'octahedron', 'octahedron', 'tetrahedron', 'tetrahedron'
        ];
        
        // Emparelhar cores e formas
        this.cardPairs = [];
        for (let i = 0; i < this.cardColors.length; i++) {
            this.cardPairs.push({
                color: this.cardColors[i],
                shape: this.cardShapes[i]
            });
        }
        
        // Shuffle the card values
        this.shuffle(this.cardPairs);
        
        // Add event listener to scene to ensure raycaster is working
        this.el.sceneEl.addEventListener('loaded', () => {
            console.log('Scene loaded, setting up game interactions');
            // Create the game board after the scene is fully loaded
            this.createBoard();
        });
        
        // Add click listener for restart button
        const restartButton = document.getElementById('restart-button');
        restartButton.addEventListener('click', () => this.resetGame());
    },
    
    shuffle: function(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    },
    
    createBoard: function() {
        const gameBoard = document.getElementById('game-board');
        
        // Clear any existing cards
        while (gameBoard.firstChild) {
            gameBoard.removeChild(gameBoard.firstChild);
        }
        
        // Card dimensions and spacing
        const cardWidth = 0.4;
        const cardHeight = 0.4;
        const gap = 0.1;
        const cols = 4;
        const rows = 4;
        
        // Calculate board dimensions
        const boardWidth = cols * cardWidth + (cols - 1) * gap;
        const boardHeight = rows * cardHeight + (rows - 1) * gap;
        
        // Calculate starting position (top-left of board)
        const startX = -boardWidth / 2 + cardWidth / 2;
        const startY = boardHeight / 2 - cardHeight / 2;
        
        // Create cards
        let cardIndex = 0;
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = startX + col * (cardWidth + gap);
                const y = startY - row * (cardHeight + gap);
                
                const cardPair = this.cardPairs[cardIndex];
                
                // Create card entity
                const card = document.createElement('a-entity');
                card.setAttribute('position', `${x} ${y} 0`);
                card.setAttribute('data-index', cardIndex);
                card.setAttribute('data-color', cardPair.color);
                card.setAttribute('data-shape', cardPair.shape);
                card.setAttribute('class', 'card');
                
                // Create card front (face-down) - Esta é a parte clicável
                const cardFront = document.createElement('a-plane');
                cardFront.setAttribute('width', cardWidth);
                cardFront.setAttribute('height', cardHeight);
                cardFront.setAttribute('color', '#1E90FF');
                cardFront.setAttribute('position', '0 0 0.01');
                cardFront.setAttribute('class', 'card-front clickable');
                
                // Adicionando componente de hover em vez de animation
                cardFront.setAttribute('card-hover', '');
                
                // Adiciona um símbolo de ? na frente
                const questionMark = document.createElement('a-text');
                questionMark.setAttribute('value', '?');
                questionMark.setAttribute('color', 'white');
                questionMark.setAttribute('position', '0 0 0.02');
                questionMark.setAttribute('align', 'center');
                questionMark.setAttribute('width', 2);
                questionMark.setAttribute('scale', '0.5 0.5 0.5');
                cardFront.appendChild(questionMark);
                
                // Adicionar evento de clique diretamente ao cardFront
                cardFront.addEventListener('click', () => {
                    console.log("Carta clicada:", cardIndex);
                    this.flipCard(card);
                });
                
                // Create card back (face-up) - Usando geometrias 3D em vez de texto
                const cardBack = document.createElement('a-entity');
                cardBack.setAttribute('position', '0 0 0.1');  // Posicionado ligeiramente à frente
                
                // Criando a forma 3D
                const shape = document.createElement('a-entity');
                let geometry, scale;
                
                switch(cardPair.shape) {
                    case 'circle':
                        geometry = 'primitive: circle; radius: 0.15';
                        scale = '1 1 1';
                        break;
                    case 'triangle':
                        geometry = 'primitive: triangle; vertexA: 0 0.15 0; vertexB: -0.15 -0.15 0; vertexC: 0.15 -0.15 0';
                        scale = '1 1 1';
                        break;
                    case 'square':
                        geometry = 'primitive: plane; width: 0.25; height: 0.25';
                        scale = '1 1 1';
                        break;
                    case 'ring':
                        geometry = 'primitive: ring; radiusInner: 0.1; radiusOuter: 0.15';
                        scale = '1 1 1';
                        break;
                    case 'torus':
                        geometry = 'primitive: torus; radius: 0.1; radiusTubular: 0.01';
                        scale = '1 1 1';
                        break;
                    case 'cone':
                        geometry = 'primitive: cone; radiusBottom: 0.15; radiusTop: 0; height: 0.25';
                        scale = '1 1 1';
                        break;
                    case 'octahedron':
                        geometry = 'primitive: octahedron; radius: 0.15';
                        scale = '1 1 1';
                        break;
                    case 'tetrahedron':
                        geometry = 'primitive: tetrahedron; radius: 0.15';
                        scale = '1 1 1';
                        break;
                    default:
                        geometry = 'primitive: box; width: 0.25; height: 0.25; depth: 0.05';
                        scale = '1 1 1';
                }
                
                shape.setAttribute('geometry', geometry);
                shape.setAttribute('material', `color: ${cardPair.color}; shader: flat`);
                shape.setAttribute('scale', scale);
                shape.setAttribute('visible', 'false');
                shape.setAttribute('class', 'shape');
                cardBack.appendChild(shape);
                
                // Create card background (for the back/revealed side)
                const cardBackBg = document.createElement('a-plane');
                cardBackBg.setAttribute('width', cardWidth);
                cardBackBg.setAttribute('height', cardHeight);
                cardBackBg.setAttribute('color', '#FFFFFF');
                cardBackBg.setAttribute('position', '0 0 0');
                cardBackBg.setAttribute('visible', 'false');
                cardBackBg.setAttribute('class', 'card-back-bg');
                
                // Add all parts to the card
                card.appendChild(cardFront);
                card.appendChild(cardBackBg);
                card.appendChild(cardBack);
                
                // Add to game board
                gameBoard.appendChild(card);
                
                // Store reference to the card
                this.cards.push(card);
                
                cardIndex++;
            }
        }

        console.log(`Criado tabuleiro com ${this.cards.length} cartas`);
    },
    
    flipCard: function(card) {
        console.log("Tentando virar carta");
        // Get card components
        const cardFront = card.querySelector('.card-front');
        const cardBackBg = card.querySelector('.card-back-bg');
        const shape = card.querySelector('.shape');
        
        // Check if card can be flipped
        if (!this.canFlip || 
            this.flippedCards.includes(card) || 
            shape.getAttribute('visible') === true) {
            console.log("Carta não pode ser virada");
            return;
        }
        
        console.log("Virando carta");
        // Flip the card
        cardFront.setAttribute('visible', false);
        cardFront.classList.remove('clickable');  // Remover clickable quando virada
        cardBackBg.setAttribute('visible', true);
        shape.setAttribute('visible', true);
        
        // Add to flipped cards
        this.flippedCards.push(card);
        
        // Check for match if we have 2 cards flipped
        if (this.flippedCards.length === 2) {
            this.canFlip = false;
            setTimeout(() => this.checkMatch(), 1000);
        }
    },
    
    checkMatch: function() {
        const card1 = this.flippedCards[0];
        const card2 = this.flippedCards[1];
        
        const color1 = card1.getAttribute('data-color');
        const color2 = card2.getAttribute('data-color');
        const shape1 = card1.getAttribute('data-shape');
        const shape2 = card2.getAttribute('data-shape');
        
        if (color1 === color2 && shape1 === shape2) {
            // Match found
            this.pairsFound++;
            
            // Update score
            document.getElementById('score').textContent = `Pairs Found: ${this.pairsFound}`;
            
            // Display message
            const messageEl = document.getElementById('message');
            messageEl.textContent = 'Match found!';
            setTimeout(() => { messageEl.textContent = ''; }, 1500);
            
            // Remove cards from game logic (keep visible)
            this.flippedCards = [];
            
            // Check if game is complete
            if (this.pairsFound === this.totalPairs) {
                this.gameComplete();
            }
        } else {
            // No match
            // Flip cards back
            this.flippedCards.forEach(card => {
                const cardFront = card.querySelector('.card-front');
                const cardBackBg = card.querySelector('.card-back-bg');
                const shape = card.querySelector('.shape');
                
                cardFront.setAttribute('visible', true);
                cardFront.classList.add('clickable');  // Restaurar clickable
                cardBackBg.setAttribute('visible', false);
                shape.setAttribute('visible', false);
            });
            
            // Display message
            const messageEl = document.getElementById('message');
            messageEl.textContent = 'No match!';
            setTimeout(() => { messageEl.textContent = ''; }, 1500);
            
            // Reset flipped cards
            this.flippedCards = [];
        }
        
        // Allow flipping again
        this.canFlip = true;
    },
    
    gameComplete: function() {
        // Show victory message
        const victoryMessage = document.getElementById('victory-message');
        victoryMessage.setAttribute('visible', true);
        victoryMessage.setAttribute('text', 'opacity', 1);
        
        // Show restart button
        const restartButton = document.getElementById('restart-button');
        restartButton.setAttribute('visible', true);
        
        // Display message
        const messageEl = document.getElementById('message');
        messageEl.textContent = 'Congratulations! You found all pairs!';
    },
    
    resetGame: function() {
        // Reset game variables
        this.flippedCards = [];
        this.pairsFound = 0;
        
        // Reset score
        document.getElementById('score').textContent = 'Pairs Found: 0';
        
        // Clear message
        document.getElementById('message').textContent = '';
        
        // Hide victory elements
        document.getElementById('victory-message').setAttribute('visible', false);
        document.getElementById('restart-button').setAttribute('visible', false);
        
        // Shuffle cards and recreate board
        this.shuffle(this.cardPairs);
        this.createBoard();
    }
});

// Componente auxiliar para melhorar o cursor
AFRAME.registerComponent('cursor-feedback', {
  init: function () {
    var el = this.el;
    
    el.addEventListener('mouseenter', function () {
      el.setAttribute('material', 'color', '#4CAF50');
    });
    
    el.addEventListener('mouseleave', function () {
      el.setAttribute('material', 'color', 'white');
    });
    
    el.addEventListener('click', function () {
      console.log('Cursor click detectado');
    });
  }
});

// Novo componente para o hover das cartas que não usa animation
AFRAME.registerComponent('card-hover', {
  init: function() {
    const el = this.el;
    const originalColor = '#1E90FF';
    const hoverColor = '#64B5F6';
    
    el.addEventListener('mouseenter', () => {
      el.setAttribute('material', 'color', hoverColor);
    });
    
    el.addEventListener('mouseleave', () => {
      el.setAttribute('material', 'color', originalColor);
    });
  }
});
