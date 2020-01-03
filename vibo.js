// The maximum is exclusive and the minimum is inclusive
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

var esnakContainer;
var esnakClassname = "sn-bod";
var frutClassname = "frut";
var gameSize = { width: 32, height: 32 };
var gameSpeed = 5;
var direction = 1; // [0 ^]  [1 >]  [2 v]  [3 <];
var body = [];
var frutPos = {};
var gameInterval;
var gameStatus = 1; // 1 playing; 0 not playing
var score = 0;
var scoreEl;

// document ready
(function() {
    init();
})();

function init() {
    esnakContainer = document.getElementById("esnak");
    scoreEl = document.getElementById("score");

    setupGrid();
    initEsnak();
    setFrut();
    initInput();

    gameInterval = setInterval(() => {
        update();
    }, 1000 / gameSpeed);
}

function setupGrid() {
    for (let i = 0; i < gameSize.height; i++) {
        let row = document.createElement("DIV");
        row.className = "row";
        row.dataset["row"] = i;

        for (let j = 0; j < gameSize.width; j++) {
            let cell = document.createElement("DIV");
            cell.className = "col";
            cell.dataset["col"] = j;

            row.appendChild(cell);
        }

        esnakContainer.appendChild(row);
    }
}

function initEsnak() {
    body.push({ x: 0, y: 0 });
    body.push({ x: 1, y: 0 });
    body.push({ x: 2, y: 0 });
}

function initInput() {
    /*
    direction | key | code
           up | 38  | 0
        right | 39  | 1
         down | 40  | 2
         left | 37  | 3
    */
    window.onkeydown = function name(e) {
        // if not arrow key exit
        if (e.keyCode < 37 || e.keyCode > 40) return;

        let currentDirection = this.direction;

        switch (e.keyCode) {
            case 38: // UP
                this.direction = 0;
                break;

            case 39: // right
                this.direction = 1;
                break;

            case 40: // down
                this.direction = 2;
                break;

            case 37: // left
                this.direction = 3;
                break;

            default:
                break;
        }

        let newCoords = getNewCoords(this.direction);
        let neckCoords = this.body[this.body.length - 2];
        // cannot move towards neck
        if (newCoords.x === neckCoords.x && newCoords.y === neckCoords.y) {
            // revert to original direction
            this.direction = currentDirection;
        }
    }
}

function setFrut() {
    let availableCells = document.querySelectorAll("#esnak .row .col:not(.sn-bod):not(.frut)");
    let cellIx = getRandomInt(0, availableCells.length);

    let choosen = availableCells[cellIx];
    frutPos.x = +choosen.dataset.col;
    frutPos.y = +choosen.parentElement.dataset.row;
}

function update() {
    if (gameStatus === 0) 
        clearInterval(gameInterval);

    moveEsnak();
    draw();
}

function moveEsnak() {
    let newCoords = getNewCoords(direction);

    let allGood = detectCollission(newCoords);

    if (allGood) {
        body.shift();
        body.push(newCoords);
    } else {
        gameStatus = 0;
        esnakContainer.classList.add("lose");
    }
}

function getNewCoords(newDirection) {
    let newCoords = {};
    let headCoords = body[body.length - 1];

    switch (newDirection) {
        case 0: // up
            newCoords.x = headCoords.x;
            newCoords.y = headCoords.y - 1;
            break;

        case 1: // right
            newCoords.x = headCoords.x + 1;
            newCoords.y = headCoords.y;
            break;

        case 2: // down
            newCoords.x = headCoords.x;
            newCoords.y = headCoords.y + 1;
            break;

        case 3: // left
            newCoords.x = headCoords.x - 1;
            newCoords.y = headCoords.y;
            break;
    }

    return newCoords;
}

function detectCollission(newCoords) {
    // collission with walls
    if (newCoords.x < 0 || newCoords.x >= gameSize.width || newCoords.y < 0 || newCoords.y >= gameSize.height) {
        return false;
    }

    // collission with self
    let esnakBody = esnakContainer.querySelectorAll("." + esnakClassname);
    let collided = false;
    for (let i = 0; i < esnakBody.length; i++) {
        const esnakPart = esnakBody[i];
        if (+esnakPart.dataset.col === newCoords.x && +esnakPart.parentElement.dataset.row === newCoords.y) {
            collided = true;
            break;
        }
    }
    
    if (collided) return false;

    // collission with fruit
    if (newCoords.x === frutPos.x && newCoords.y === frutPos.y) {
        score++;
        addPart();
        setFrut();
    }

    return true;
}

function addPart() {
    let newPart = { x: body[0].x, y: body[0].y };
    body.unshift(newPart);
}

function draw() {
    if (gameStatus === 0) {
        document.getElementById('message').textContent = "You lose";
        return;
    }

    scoreEl.textContent = score.toLocaleString();

    let esnakBody = esnakContainer.querySelectorAll("." + esnakClassname);
    if (esnakBody.length > 0) {
        for (let i = 0; i < esnakBody.length; i++) {
            const cell = esnakBody[i];
            cell.classList.remove(esnakClassname);
        }
    }

    let frutCell = esnakContainer.querySelector("." + frutClassname);
    if (frutCell)
        frutCell.classList.remove(frutClassname);

    for (let i = 0; i < body.length; i++) {
        const cellCoords = body[i];

        let cell = document.querySelector(`[data-row='${cellCoords.y}'] > [data-col='${cellCoords.x}']`);
        cell.classList.add(esnakClassname);
    }

    let newFrutCell = document.querySelector(`[data-row='${frutPos.y}'] > [data-col='${frutPos.x}']`);
    newFrutCell.classList.add(frutClassname);

}
