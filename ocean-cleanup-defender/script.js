const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const livesDisplay = document.getElementById('lives');
const startButton = document.getElementById('startButton');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreDisplay = document.getElementById('finalScore');
const restartButton = document.getElementById('restartButton');

let score = 0;
let lives = 3;
let gameRunning = false;
let player;
let debris = [];
let oilSlicks = [];
let gameFrame = 0;
let animationId;

const PLAYER_SPEED = 5;
const DEBRIS_SPEED = 2;
const OIL_SLICK_SPEED = 1.5;

// Player object
class Player {
    constructor() {
        this.width = 40;
        this.height = 40;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = canvas.height - this.height - 10;
        this.color = 'blue';
        this.dx = 0; // Direction x
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    update() {
        this.x += this.dx;

        // Boundary checks
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > canvas.width) this.x = canvas.width - this.width;
    }
}

// Debris (collectible) object
class Debris {
    constructor() {
        this.width = 20;
        this.height = 20;
        this.x = Math.random() * (canvas.width - this.width);
        this.y = -this.height; // Start above canvas
        this.color = 'lightgray';
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    update() {
        this.y += DEBRIS_SPEED;
    }
}

// Oil Slick (obstacle) object
class OilSlick {
    constructor() {
        this.width = 60;
        this.height = 30;
        this.x = Math.random() * (canvas.width - this.width);
        this.y = -this.height; // Start above canvas
        this.color = 'darkgreen'; // Represent oil as dark green blob
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    update() {
        this.y += OIL_SLICK_SPEED;
    }
}

function initGame() {
    score = 0;
    lives = 3;
    debris = [];
    oilSlicks = [];
    gameFrame = 0;
    player = new Player();

    scoreDisplay.textContent = score;
    livesDisplay.textContent = lives;
    gameOverScreen.classList.add('hidden');
    startButton.classList.remove('hidden'); // Show start button again if coming from game over
}

function startGame() {
    gameRunning = true;
    startButton.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    score = 0;
    lives = 3;
    debris = [];
    oilSlicks = [];
    gameFrame = 0;
    player = new Player();
    scoreDisplay.textContent = score;
    livesDisplay.textContent = lives;

    gameLoop();
}

function endGame() {
    gameRunning = false;
    cancelAnimationFrame(animationId);
    finalScoreDisplay.textContent = score;
    gameOverScreen.classList.remove('hidden');
}

function gameLoop() {
    if (!gameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas

    player.update();
    player.draw();

    // Generate debris and oil slicks
    if (gameFrame % 100 === 0) { // Adjust frequency of debris spawning
        debris.push(new Debris());
    }
    if (gameFrame % 200 === 0) { // Adjust frequency of oil slick spawning
        oilSlicks.push(new OilSlick());
    }

    // Update and draw debris
    for (let i = 0; i < debris.length; i++) {
        debris[i].update();
        debris[i].draw();

        // Collision detection with player
        if (
            player.x < debris[i].x + debris[i].width &&
            player.x + player.width > debris[i].x &&
            player.y < debris[i].y + debris[i].height &&
            player.y + player.height > debris[i].y
        ) {
            score += 10;
            scoreDisplay.textContent = score;
            debris.splice(i, 1); // Remove collected debris
            i--;
        }

        // Remove debris that goes off screen
        if (debris[i] && debris[i].y > canvas.height) {
            debris.splice(i, 1);
            i--;
        }
    }

    // Update and draw oil slicks
    for (let i = 0; i < oilSlicks.length; i++) {
        oilSlicks[i].update();
        oilSlicks[i].draw();

        // Collision detection with player (lose life)
        if (
            player.x < oilSlicks[i].x + oilSlicks[i].width &&
            player.x + player.width > oilSlicks[i].x &&
            player.y < oilSlicks[i].y + oilSlicks[i].height &&
            player.y + player.height > oilSlicks[i].y
        ) {
            lives--;
            livesDisplay.textContent = lives;
            oilSlicks.splice(i, 1); // Remove oil slick after collision
            i--;
            if (lives <= 0) {
                endGame();
                return; // Stop game loop immediately
            }
        }

        // Remove oil slicks that go off screen
        if (oilSlicks[i] && oilSlicks[i].y > canvas.height) {
            oilSlicks.splice(i, 1);
            i--;
        }
    }

    gameFrame++;
    animationId = requestAnimationFrame(gameLoop);
}

// Event Listeners for Player Movement
document.addEventListener('keydown', e => {
    if (gameRunning) {
        if (e.key === 'ArrowLeft' || e.key === 'a') {
            player.dx = -PLAYER_SPEED;
        } else if (e.key === 'ArrowRight' || e.key === 'd') {
            player.dx = PLAYER_SPEED;
        }
    }
});

document.addEventListener('keyup', e => {
    if (gameRunning && (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'ArrowRight' || e.key === 'd')) {
        player.dx = 0;
    }
});

startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', startGame);

// Initial setup
initGame();
