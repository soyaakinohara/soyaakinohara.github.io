const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const livesDisplay = document.getElementById('lives');
const gameInfoDisplay = document.querySelector('.game-info');
const startButton = document.getElementById('startButton');
const retryButton = document.getElementById('retryButton');

// --- ゲーム設定 ---
const PADDLE_WIDTH = 70;
const PADDLE_HEIGHT = 10;
const BALL_RADIUS = 8;
const BRICK_ROW_COUNT = 4;
const BRICK_COLUMN_COUNT = 7;
const BRICK_WIDTH = 50;
const BRICK_HEIGHT = 20;
const BRICK_PADDING = 5;
const BRICK_OFFSET_TOP = 30;
const BRICK_OFFSET_LEFT = (350 - (BRICK_COLUMN_COUNT * (BRICK_WIDTH + BRICK_PADDING) - BRICK_PADDING)) / 2;

canvas.width = 350;
canvas.height = 450;

let paddleX = (canvas.width - PADDLE_WIDTH) / 2;
let lives = 3;
let score = 0;
let gameRunning = false;
let animationFrameId;

let balls = [];
const brickColors = ["#FF0000", "#FFA500", "#FFFF00", "#008000", "#0000FF", "#4B0082", "#EE82EE"];
let effectColors = {};

// --- オブジェクト ---
function createBall(x, y, dx, dy, color = "black") {
    return { x, y, dx, dy, radius: BALL_RADIUS, color };
}

let bricks = [];

// --- 初期化関連 ---
function assignBrickEffects() {
    effectColors = {};
    const availableColors = [...brickColors];
    const effects = ["speedUp", "addBall"];
    for (const effect of effects) {
        if (availableColors.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableColors.length);
            const selectedColor = availableColors.splice(randomIndex, 1)[0];
            effectColors[selectedColor] = effect;
        }
    }
}

function initBricks() {
    bricks = [];
    assignBrickEffects();
    for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
        bricks[c] = [];
        for (let r = 0; r < BRICK_ROW_COUNT; r++) {
            const brickX = (c * (BRICK_WIDTH + BRICK_PADDING)) + BRICK_OFFSET_LEFT;
            const brickY = (r * (BRICK_HEIGHT + BRICK_PADDING)) + BRICK_OFFSET_TOP;
            const colorIndex = Math.floor(Math.random() * brickColors.length);
            const color = brickColors[colorIndex];
            bricks[c][r] = {
                x: brickX, y: brickY,
                width: BRICK_WIDTH, height: BRICK_HEIGHT,
                color: color, status: 1,
                effect: effectColors[color] || null
            };
        }
    }
}

function resetBallAndPaddle(ball) {
    ball.x = canvas.width / 2;
    ball.y = canvas.height - PADDLE_HEIGHT - BALL_RADIUS - 5;
    ball.dx = 2.5 * (Math.random() < 0.5 ? 1 : -1);
    ball.dy = -2.5;
    paddleX = (canvas.width - PADDLE_WIDTH) / 2;
}

function addInitialBall() {
    balls = [];
    const newBall = createBall(0, 0, 0, 0);
    resetBallAndPaddle(newBall);
    balls.push(newBall);
}

// --- 描画関数 ---
function drawBall(ball) {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = ball.color;
    ctx.fill();
    ctx.closePath();
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - PADDLE_HEIGHT, PADDLE_WIDTH, PADDLE_HEIGHT);
    ctx.fillStyle = "#333";
    ctx.fill();
    ctx.closePath();
}

function drawBricks() {
    for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
        for (let r = 0; r < BRICK_ROW_COUNT; r++) {
            if (bricks[c][r].status == 1) {
                const brick = bricks[c][r];
                ctx.beginPath();
                ctx.rect(brick.x, brick.y, brick.width, brick.height);
                ctx.fillStyle = brick.color;
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

function drawScore() {
    scoreDisplay.textContent = "Score: " + score;
}

function drawLives() {
    livesDisplay.textContent = "Lives: " + lives;
}

// --- 衝突検知 ---
function collisionDetection() {
    for (let i = balls.length - 1; i >= 0; i--) {
        const ball = balls[i];

        if (ball.x + ball.dx > canvas.width - ball.radius || ball.x + ball.dx < ball.radius) {
            ball.dx = -ball.dx;
        }
        if (ball.y + ball.dy < ball.radius) {
            ball.dy = -ball.dy;
        } else if (ball.y + ball.dy > canvas.height - ball.radius - PADDLE_HEIGHT) {
            if (ball.x > paddleX && ball.x < paddleX + PADDLE_WIDTH && ball.y + ball.radius < canvas.height) {
                if (ball.y + ball.dy > canvas.height - PADDLE_HEIGHT - ball.radius) {
                    ball.dy = -ball.dy;
                    let collidePoint = ball.x - (paddleX + PADDLE_WIDTH / 2);
                    ball.dx = collidePoint * 0.1;
                }
            } else if (ball.y + ball.dy > canvas.height - ball.radius) {
                balls.splice(i, 1);
                if (balls.length === 0) {
                    lives--;
                    if (lives <= 0) {
                        gameOver();
                    } else {
                        addInitialBall();
                    }
                }
            }
        }

        for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
            for (let r = 0; r < BRICK_ROW_COUNT; r++) {
                const brick = bricks[c][r];
                if (brick.status == 1) {
                    if (ball.x > brick.x && ball.x < brick.x + brick.width &&
                        ball.y > brick.y && ball.y < brick.y + brick.height) {
                        ball.dy = -ball.dy;
                        brick.status = 0;
                        score += 10;

                        if (brick.effect) {
                            if (brick.effect === "speedUp") {
                                ball.dx *= 1.2;
                                ball.dy *= 1.2;
                            } else if (brick.effect === "addBall") {
                                balls.push(createBall(ball.x, ball.y, -ball.dx, ball.dy, "blue"));
                            }
                        }
                        if (checkWin()) gameWin();
                    }
                }
            }
        }
    }
}

// --- ゲーム制御 ---
function checkWin() {
    for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
        for (let r = 0; r < BRICK_ROW_COUNT; r++) {
            if (bricks[c][r].status == 1) return false;
        }
    }
    return true;
}

function stopGameAnimation() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null; // IDをクリア
    }
}

function gameOver() {
    gameRunning = false;
    ctx.font = "24px Arial";
    ctx.fillStyle = "red";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 20);
    retryButton.style.display = "block";
    stopGameAnimation();
}

function gameWin() {
    gameRunning = false;
    ctx.font = "24px Arial";
    ctx.fillStyle = "green";
    ctx.textAlign = "center";
    ctx.fillText("YOU WIN!", canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = "16px Arial";
    ctx.fillText("Score: " + score, canvas.width / 2, canvas.height / 2 + 10);
    retryButton.style.display = "block";
    stopGameAnimation();
}

function initializeGame() {
    lives = 3;
    score = 0;
    initBricks();
    addInitialBall();
    drawScore(); // 初期スコア表示
    drawLives(); // 初期ライフ表示
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Canvasをクリア
    drawBricks(); // 初期ブロック描画
    drawPaddle(); // 初期パドル描画
    balls.forEach(drawBall); // 初期ボール描画
}


function startGame() {
    stopGameAnimation(); // 既存のアニメーションがあれば停止
    initializeGame(); // ゲーム状態を初期化
    gameRunning = true;
    startButton.style.display = "none";
    retryButton.style.display = "none";
    gameInfoDisplay.style.visibility = "visible";
    
    // Canvasをクリアしてから最初のフレームを描画
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    mainLoop(); // メインループを開始
}

function restartGame() {
    stopGameAnimation();
    initializeGame();
    gameRunning = true;
    retryButton.style.display = "none";
    gameInfoDisplay.style.visibility = "visible";

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    mainLoop();
}

// --- メインループ ---
function mainLoop() {
    if (!gameRunning) {
        stopGameAnimation();
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawPaddle();
    balls.forEach(ball => {
        drawBall(ball);
        ball.x += ball.dx;
        ball.y += ball.dy;
    });
    collisionDetection();
    drawScore();
    drawLives();

    animationFrameId = requestAnimationFrame(mainLoop);
}

// --- イベントリスナー ---
document.addEventListener("mousemove", mouseMoveHandler, false);
function mouseMoveHandler(e) {
    let relativeX = e.clientX - canvas.getBoundingClientRect().left;
    if (relativeX > 0 && relativeX < canvas.width) {
        paddleX = relativeX - PADDLE_WIDTH / 2;
        if (paddleX < 0) paddleX = 0;
        if (paddleX + PADDLE_WIDTH > canvas.width) paddleX = canvas.width - PADDLE_WIDTH;
    }
}

canvas.addEventListener("touchmove", touchMoveHandler, { passive: false });
canvas.addEventListener("touchstart", touchMoveHandler, { passive: false });
function touchMoveHandler(e) {
    e.preventDefault();
    if (e.touches && e.touches.length > 0) {
        let relativeX = e.touches[0].clientX - canvas.getBoundingClientRect().left;
        if (relativeX > 0 && relativeX < canvas.width) {
            paddleX = relativeX - PADDLE_WIDTH / 2;
            if (paddleX < 0) paddleX = 0;
            if (paddleX + PADDLE_WIDTH > canvas.width) paddleX = canvas.width - PADDLE_WIDTH;
        }
    }
}

startButton.addEventListener("click", startGame);
retryButton.addEventListener("click", restartGame);

// --- 初期表示 ---
// ページロード時には何も描画せず、スタートボタンのクリックを待つ
// ただし、Canvasの初期クリアは行っておく
ctx.clearRect(0, 0, canvas.width, canvas.height);
// 必要であれば、ここに静的な初期画面（タイトルなど）を描画する処理を追加しても良い
// 例:
// ctx.font = "24px Arial";
// ctx.fillStyle = "#333";
// ctx.textAlign = "center";
// ctx.fillText("ブロック崩し", canvas.width / 2, canvas.height / 2 - 50);