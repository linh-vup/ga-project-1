function init() {
  const grid = document.querySelector(".grid");
  const livesDisplay = document.querySelector("#lives");
  const goalDisplay = document.querySelector("#in-goal");
  const startButton = document.querySelector("#start");
  const restartButton = document.querySelector("#restart");
  const easyButton = document.querySelector("#easy-game");
  const mediumButton = document.querySelector("#medium-game");
  const difficultButton = document.querySelector("#difficult-game");
  const overlayHeaderOneText = document.querySelector("#overlay-h1");
  const overlayHeaderThreeText = document.querySelector("#overlay-h3");

  // define game config
  const game = {
    width: 13,
    lanes: [
      {
        laneRow: 0,
        type: "safezone",
      },
      {
        laneRow: 1,
        type: "obstacle",
        direction: "left",
        intervalSpeed: 2000,
        movesCharacter: true,
        obstacle: {
          length: 3,
          gapLength: 5,
        },
      },
      {
        laneRow: 2,
        type: "obstacle",
        direction: "right",
        intervalSpeed: 3000,
        movesCharacter: true,
        obstacle: {
          length: 2,
          gapLength: 2,
        },
      },
      {
        laneRow: 3,
        type: "obstacle",
        direction: "left",
        intervalSpeed: 4000,
        movesCharacter: true,
        obstacle: {
          length: 1,
          gapLength: 3,
        },
      },
      {
        laneRow: 4,
        type: "obstacle",
        direction: "left",
        intervalSpeed: 3500,
        movesCharacter: false,
        obstacle: {
          length: 1,
          gapLength: 3,
        },
      },
      {
        laneRow: 5,
        type: "safezone",
      },
      {
        laneRow: 6,
        type: "fixedObstacle",
        direction: "left",
        movesCharacter: false,
        obstacle: {
          length: 3,
          gapLength: 4,
        },
      },
      {
        laneRow: 7,
        type: "obstacle",
        direction: "left",
        intervalSpeed: 2000,
        movesCharacter: false,
        obstacle: {
          length: 2,
          gapLength: 5,
        },
      },
      {
        laneRow: 8,
        type: "obstacle",
        direction: "right",
        intervalSpeed: 2500,
        movesCharacter: false,
        obstacle: {
          length: 1,
          gapLength: 4,
        },
      },
      {
        laneRow: 9,
        type: "obstacle",
        direction: "left",
        intervalSpeed: 3000,
        movesCharacter: false,
        obstacle: {
          length: 1,
          gapLength: 3,
        },
      },
      {
        laneRow: 10,
        type: "obstacle",
        direction: "left",
        intervalSpeed: 3500,
        movesCharacter: false,
        obstacle: {
          length: 1,
          gapLength: 4,
        },
      },
      {
        laneRow: 11,
        type: "safezone",
      },
    ],
  };

  // keeps track of player's coordinates
  const playerPosition = {
    x: 0,
    y: 0,
  };

  // class name that will be used to identify obstacles
  const obstacleClass = "obstacle";

  // array to hold one array per lane, containing all divs for respective lanes
  const cells = [];

  const timers = [];
  let playerLives = 5;
  let isGamePaused = false;
  let playersInGoal = 0;

  function loadGame() {
    setupGrid();
    setupObstacles();
    moveObstacles(1);
  }

  // populate cells array and add divs to document
  function setupGrid() {
    for (let i = 0; i < game.lanes.length; i++) {
      // add rows (lanes)
      const laneCells = [];
      const laneDiv = document.createElement("div");
      laneDiv.classList.add("lane");
      laneDiv.setAttribute("id", `lane-${i}`);

      // add cells to each row
      for (let x = 0; x < game.width; x++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        laneDiv.appendChild(cell);
        laneCells.push(cell);
      }

      // console.log(laneCells);
      cells.push(laneCells);
      grid.appendChild(laneDiv);
    }
    goalLane();
  }

  // add obstacle to lane
  function setupObstacles() {
    for (let i = 0; i < game.lanes.length; i++) {
      const gameLane = game.lanes[i];
      const laneCells = cells[i];
      if (gameLane.type === "safezone") {
        continue;
      }
      const obstacleLength = gameLane.obstacle.length;
      const gapLength = gameLane.obstacle.gapLength;

      let remainingObstacleCells = obstacleLength;
      let remainingGapCells = 0;
      laneCells.forEach((cell) => {
        // for (let i = 0; i < laneCells.length; i++) {
        //   const cell = laneCells[i];
        if (remainingObstacleCells > 0) {
          if (gameLane.type === "fixedObstacle") {
            cell.classList.add("blocked-cells");
          } else {
            cell.classList.add(obstacleClass);
          }
          remainingObstacleCells--;
          if (remainingObstacleCells === 0) {
            remainingGapCells = gapLength;
          }
        } else if (remainingGapCells > 0) {
          remainingGapCells--;
          if (remainingGapCells === 0) {
            remainingObstacleCells = obstacleLength;
          }
        }
      });
    }
  }

  // set timer to move obstacles in lane
  function moveObstacles(multiplier) {
    for (let y = 0; y < game.lanes.length; y++) {
      const gameLane = game.lanes[y];
      const laneCells = cells[y];

      if (gameLane.type === "safezone" || gameLane.type === "fixedObstacle") {
        continue;
      }

      const timer = setInterval(() => {
        if (!isGamePaused) {
          const previousObstacles = laneCells.map((cell) =>
            cell.classList.contains(obstacleClass)
          );
          // to do: use a forEach, but mind cell and i
          for (let x = 0; x < laneCells.length; x++) {
            const cell = laneCells[x];
            switch (gameLane.direction) {
              case "left":
                if (previousObstacles[(x + 1) % laneCells.length]) {
                  cell.classList.add(obstacleClass);
                } else {
                  cell.classList.remove(obstacleClass);
                }
                break;
              case "right": {
                if (
                  previousObstacles[
                    (x - 1 + laneCells.length) % laneCells.length
                  ]
                ) {
                  cell.classList.add(obstacleClass);
                } else {
                  cell.classList.remove(obstacleClass);
                }
                break;
              }
            }
          }
          if (
            gameLane.direction === "left" &&
            gameLane.movesCharacter &&
            playerPosition.x > 0 &&
            playerPosition.y === y
          ) {
            movePlayer(playerPosition.x - 1, playerPosition.y);
          }
          if (
            gameLane.direction === "right" &&
            gameLane.movesCharacter &&
            playerPosition.x < laneCells.length - 1 &&
            playerPosition.y === y
          ) {
            movePlayer(playerPosition.x + 1, playerPosition.y);
          }
          evaluatePlayerPosition();
        }
      }, gameLane.intervalSpeed * multiplier);
      timers.push(timer);
    }
  }

  // check keystroke and move player accordingly
  function handleKeyUp(event) {
    if (isGamePaused) {
      return;
    }
    switch (
      event.code // * calculate the next position and update it
    ) {
      case "ArrowRight":
        if (
          playerPosition.x < game.width - 1 &&
          !cells[playerPosition.y][playerPosition.x + 1].classList.contains(
            "blocked-cells"
          )
        ) {
          movePlayer(playerPosition.x + 1, playerPosition.y);
        }
        break;
      case "ArrowLeft":
        if (
          playerPosition.x > 0 &&
          !cells[playerPosition.y][playerPosition.x - 1].classList.contains(
            "blocked-cells"
          )
        ) {
          movePlayer(playerPosition.x - 1, playerPosition.y);
        }
        break;
      case "ArrowUp":
        if (
          playerPosition.y > 0 &&
          !cells[playerPosition.y - 1][playerPosition.x].classList.contains(
            "blocked-cells"
          )
        ) {
          movePlayer(playerPosition.x, playerPosition.y - 1);
        }
        break;
      case "ArrowDown":
        if (
          playerPosition.y < game.lanes.length - 1 &&
          !cells[playerPosition.y + 1][playerPosition.x].classList.contains(
            "blocked-cells"
          )
        ) {
          movePlayer(playerPosition.x, playerPosition.y + 1);
        }
        break;
      default:
        console.log("invalid key do nothing");
    }
  }

  // returns div of current player position
  function getPlayerPositionCell() {
    return cells[playerPosition.y][playerPosition.x];
  }

  // move player to position x, y
  function movePlayer(x, y) {
    console.log(x, y);
    getPlayerPositionCell().classList.remove("foxy");

    playerPosition.x = x;
    playerPosition.y = y;

    // console.log(playerPosition);
    // console.log(cells);
    // console.log(cells[playerPosition.y][playerPosition.x]);
    getPlayerPositionCell().classList.add("foxy");
    evaluatePlayerPosition();
  }

  function resetPlayerPosition() {
    movePlayer(Math.floor(game.width / 2), game.lanes.length - 1);
  }
  // checks if player landed on obstacles or reached last lane. if so, end game.
  function evaluatePlayerPosition() {
    if (getPlayerPositionCell().classList.contains(obstacleClass)) {
      if (playerLives > 0) {
        removePlayerLives();
        getPlayerPositionCell().setAttribute("id", "clash");
        setTimeout(anotherTurn, 1500);
      } else {
        gameOver();
      }
    } else if (
      getPlayerPositionCell().classList.contains("goal") &&
      !getPlayerPositionCell().classList.contains("foxyWinner")
    ) {
      if (playersInGoal < 3) {
        addPlayerToGoal();
        setTimeout(anotherTurn, 1500);
      }
      if (playersInGoal === 3) {
        setTimeout(gameWon, 500);
      }
    }
  }

  // function to reset playerposition to original and obstacles to move again
  function anotherTurn() {
    getPlayerPositionCell().removeAttribute("id");
    resetPlayerPosition();
    isGamePaused = false;
  }
  function removePlayerLives() {
    playerLives--;
    livesDisplay.innerHTML = playerLives;
    isGamePaused = true;
  }
  function addPlayerToGoal() {
    getPlayerPositionCell().classList.add("foxyWinner");
    playersInGoal++;
    goalDisplay.innerHTML = playersInGoal;
    isGamePaused = true;
  }

  let gameStatus = "";

  function gameOver() {
    // alert("Game Over!");
    clearTimers();
    gameStatus = "lost";
    overlayOn();
  }
  function gameWon() {
    isGamePaused = true;
    gameStatus = "won";
    overlayOn();
  }

  // function makeGameMediumDifficult(event, gameLane) {
  //   if (game.lanes.type === "safezone") {
  //     return;
  //   }
  //   gameLane.forEach(
  //     (el) => (gameLane.intervalSpeed = gameLane.intervalSpeed - 2000)
  //   );
  // }

  function goalLane() {
    cells[0].at(3).classList.add("goal");
    cells[0].at(6).classList.add("goal");
    cells[0].at(9).classList.add("goal");
    cells[0].filter((cell) => {
      if (!cell.classList.contains("goal")) {
        cell.classList.add("blocked-cells");
      }
    });
  }
  function overlayOn() {
    document.getElementById("overlay").style.display = "flex";
    if (gameStatus === "won") {
      overlayHeaderOneText.innerHTML = "Congratulations!";
      overlayHeaderThreeText.innerHTML =
        "All three foxes are home. Would you like to help the next skulk of foxes to get home?";
    } else {
      overlayHeaderOneText.innerHTML = "Oh no!";
      overlayHeaderThreeText.innerHTML = "Would you like to try again?";
    }
  }
  function overlayOff() {
    document.getElementById("overlay").style.display = "none";
  }

  function clearTimers() {
    timers.forEach((timer) => clearInterval(timer));
  }

  function restartGame() {
    overlayOff();
    clearTimers();
    cells.filter((array) => {
      array.filter((div) => {
        if (div.classList.contains("foxyWinner")) {
          div.classList.remove("foxyWinner");
        }
      });
    });
    moveObstacles(1);
    resetPlayerPosition();
    playerLives = 5;
    livesDisplay.innerHTML = playerLives;
    playersInGoal = 0;
    goalDisplay.innerHTML = playersInGoal;
  }

  loadGame();

  // start listening to key events
  document.addEventListener("keyup", handleKeyUp);
  startButton.addEventListener("click", loadGame);
  restartButton.addEventListener("click", restartGame);
  easyButton.addEventListener("click", function () {
    clearTimers();
    moveObstacles(1);
  });
  mediumButton.addEventListener("click", function () {
    clearTimers();
    moveObstacles(0.5);
  });
  difficultButton.addEventListener("click", function () {
    clearTimers();
    moveObstacles(0.2);
  });
  window.addEventListener(
    "keydown",
    function (e) {
      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(e.code) > -1
      ) {
        e.preventDefault();
      }
    },
    false
  );

  // move player to initial position
  resetPlayerPosition();
}
document.addEventListener("DOMContentLoaded", init);
