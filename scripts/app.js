function init() {
  const grid = document.querySelector(".grid");
  const livesDisplay = document.querySelector("#lives");
  const goalDisplay = document.querySelector("#in-goal");

  // define game config
  const game = {
    difficulty: 1,
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
        movesCharacter: false,
        obstacle: {
          length: 2,
          gapLength: 5,
        },
      },
      {
        laneRow: 2,
        type: "obstacle",
        direction: "right",
        intervalSpeed: 3000,
        movesCharacter: false,
        obstacle: {
          length: 1,
          gapLength: 3,
        },
      },
      {
        laneRow: 3,
        type: "obstacle",
        direction: "left",
        intervalSpeed: 4000,
        movesCharacter: false,
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
        type: "safezone",
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

  // populate cells array and add divs to document
  function setupGrid() {
    // add rows (lanes)
    for (let y = 0; y < game.lanes.length; y++) {
      const gameLane = game.lanes[y];
      const laneCells = [];
      const laneDiv = document.createElement("div");
      laneDiv.classList.add("lane");
      laneDiv.setAttribute("id", `lane-${y}`);

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

      setupObstacles(laneCells, gameLane);
      moveObstacles(laneCells, gameLane);
      goalLane();
    }
  }

  // add obstacle to lane
  function setupObstacles(laneCells, gameLane) {
    if (gameLane.type === "safezone") {
      return;
    }
    const obstacleLength = gameLane.obstacle.length;
    const gapLength = gameLane.obstacle.gapLength;

    let remainingObstacleCells = obstacleLength;
    let remainingGapCells = 0;
    laneCells.forEach((cell) => {
      // for (let i = 0; i < laneCells.length; i++) {
      //   const cell = laneCells[i];
      if (remainingObstacleCells > 0) {
        cell.classList.add(obstacleClass);
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

  // set timer to move obstacles in lane
  function moveObstacles(laneCells, gameLane) {
    if (gameLane.type === "safezone") {
      return;
    }

    const timer = setInterval(() => {
      if (!isGamePaused) {
        const previousObstacles = laneCells.map((cell) =>
          cell.classList.contains(obstacleClass)
        );
        // to do: use a forEach, but mind cell and i
        for (let i = 0; i < laneCells.length; i++) {
          const cell = laneCells[i];
          switch (gameLane.direction) {
            case "left":
              if (previousObstacles[(i + 1) % laneCells.length]) {
                cell.classList.add(obstacleClass);
              } else {
                cell.classList.remove(obstacleClass);
              }
              break;
            case "right": {
              if (
                previousObstacles[(i - 1 + laneCells.length) % laneCells.length]
              ) {
                cell.classList.add(obstacleClass);
              } else {
                cell.classList.remove(obstacleClass);
              }
              break;
            }
          }
        }

        evaluatePlayerPosition();
      }
    }, gameLane.intervalSpeed);
    timers.push(timer);
  }

  // check keystroke and move player accordingly
  function handleKeyUp(event) {
    if (isGamePaused) {
      return;
    }
    switch (
      event.key // * calculate the next position and update it
    ) {
      case "ArrowRight":
        if (playerPosition.x < game.width - 1) {
          movePlayer(playerPosition.x + 1, playerPosition.y);
        }
        break;
      case "ArrowLeft":
        if (playerPosition.x > 0) {
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
        if (playerPosition.y < game.lanes.length - 1) {
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
        console.log(playersInGoal);
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
  function gameOver() {
    alert("Game Over!");
  }
  function gameWon() {
    isGamePaused = true;
    alert("You won! All foxes are home safely!");
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
  // function clearTimers() {
  //   timers.forEach((timer) => clearInterval(timer));
  // }

  setupGrid();

  // start listening to key events
  document.addEventListener("keyup", handleKeyUp);

  resetPlayerPosition();
  // move player to initial position
}
document.addEventListener("DOMContentLoaded", init);
