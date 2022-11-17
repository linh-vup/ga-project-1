function init() {
  const grid = document.querySelector(".grid");
  const livesDisplay = document.querySelector("#lives");
  const goalDisplay = document.querySelector("#in-goal");
  const difficultyDisplay = document.querySelector("#difficulty-display");
  const startButton = document.querySelector("#start");
  const restartButton = document.querySelector("#restart");
  const overlayHeaderOneText = document.querySelector("#overlay-h1");
  const overlayHeaderThreeText = document.querySelector("#overlay-h3");
  const settingsIcon = document.querySelector("#settings-icon");
  const closeSettingsIcon = document.querySelector("#close-icon");
  const difficultyForm = document.querySelector("#form-difficulty");
  let radioButtonDefault = document.getElementById("easy");

  // define game config
  const game = {
    width: 13,
    lanes: [
      {
        laneRow: 0,
        type: "safezone",
        targetCount: 3,
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
        intervalSpeed: 1800,
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
        intervalSpeed: 3200,
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

  const gameState = {
    state: "running",
    playersInGoal: 0,
    playerLives: 5,
    difficulty: "easy",
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
        if (gameState.state === "running") {
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
    if (gameState.state !== "running") {
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
    getPlayerPositionCell().classList.remove("foxy");

    playerPosition.x = x;
    playerPosition.y = y;

    getPlayerPositionCell().classList.add("foxy");
    evaluatePlayerPosition();
  }

  function resetPlayerPosition() {
    movePlayer(Math.floor(game.width / 2), game.lanes.length - 1);
  }
  // checks if player landed on obstacles or reached last lane. if so, end game.
  function evaluatePlayerPosition() {
    if (getPlayerPositionCell().classList.contains(obstacleClass)) {
      if (gameState.playerLives > 0) {
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
      if (gameState.playersInGoal < 3) {
        addPlayerToGoal();
        setTimeout(anotherTurn, 1000);
      }
      if (gameState.playersInGoal === 3) {
        setTimeout(gameWon, 500);
      }
    }
  }

  // function to reset playerposition to original and obstacles to move again
  function anotherTurn() {
    getPlayerPositionCell().removeAttribute("id");
    resetPlayerPosition();
    gameState.state = "running";
  }
  function removePlayerLives() {
    gameState.playerLives--;
    livesDisplay.innerHTML = gameState.playerLives;
    gameState.state = "paused";
  }
  function addPlayerToGoal() {
    getPlayerPositionCell().classList.add("foxyWinner");
    gameState.playersInGoal++;
    goalDisplay.innerHTML = gameState.playersInGoal;
    gameState.state = "paused";
  }

  function gameOver() {
    clearTimers();
    gameState.state = "lost";
    overlayOn();
  }
  function gameWon() {
    gameState.state = "won";
    overlayOn();
    if (gameState.state === "won" && gameState.difficulty === "difficult") {
      unlockUnhingedLevel();
    }
    console.log(gameState.state, gameState.difficulty);
  }

  function unlockUnhingedLevel() {
    document.getElementById("unhinged-div").style.display = "block";
  }

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
    document.getElementById("overlay-game-end").style.display = "flex";
    if (gameState.state === "won" && gameState.difficulty === "difficult") {
      overlayHeaderOneText.innerHTML = "Easter Egg unlocked!";
      overlayHeaderThreeText.innerHTML =
        "You can now choose from another difficulty level! Go to game settings to check it out";
    } else if (gameState.state === "won") {
      overlayHeaderOneText.innerHTML = "Congratulations!";
      overlayHeaderThreeText.innerHTML =
        "All three foxes are home. Would you like to help the next skulk of foxes to get home, maybe with a more difficult level?";
    } else if (gameState.state === "lost") {
      overlayHeaderOneText.innerHTML = "Oh no!";
      overlayHeaderThreeText.innerHTML = "Would you like to try again?";
    }
  }
  function overlayOff() {
    document.getElementById("overlay-game-end").style.display = "none";
    document.getElementById("overlay-settings").style.display = "none";
  }
  function settingsOverlayOn() {
    document.getElementById("overlay-settings").style.display = "flex";
  }
  // function settingsOverlayOff() {
  //   document.getElementById("overlay-settings").style.display = "none";
  // }

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
    gameState.state = "running";
    gameState.difficulty = "easy";
    difficultyDisplay.innerHTML = "Easy";
    radioButtonDefault.checked = true;
    gameState.playerLives = 5;
    livesDisplay.innerHTML = gameState.playerLives;
    gameState.playersInGoal = 0;
    goalDisplay.innerHTML = gameState.playersInGoal;
  }

  //refactor
  function chooseDifficulty(event) {
    if (document.getElementById("easy").checked) {
      clearTimers();
      moveObstacles(1);
      gameState.difficulty = "easy";
      difficultyDisplay.innerHTML = "Easy";
    } else if (document.getElementById("medium").checked) {
      clearTimers();
      moveObstacles(0.4);
      gameState.difficulty = "medium";
      difficultyDisplay.innerHTML = "Medium";
    } else if (document.getElementById("difficult").checked) {
      clearTimers();
      moveObstacles(0.2);
      gameState.difficulty = "difficult";
      difficultyDisplay.innerHTML = "Difficult";
    } else if (document.getElementById("unhinged").checked) {
      clearTimers();
      moveObstacles(0.05);
      gameState.difficulty = "unhinged";
      difficultyDisplay.innerHTML = "Unhinged";
    }
  }

  loadGame();

  // start listening to key events
  document.addEventListener("keyup", handleKeyUp);
  // startButton.addEventListener("click", loadGame);
  restartButton.addEventListener("click", restartGame);
  difficultyForm.addEventListener("change", chooseDifficulty);

  settingsIcon.addEventListener("click", settingsOverlayOn);
  closeSettingsIcon.addEventListener("click", overlayOff);
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
