function init() {
  const grid = document.querySelector(".grid");

  // define game config
  const game = {
    difficulty: 1,
    width: 12,
    lanes: [
      {
        isSafeLane: true,
      },
      {
        direction: "left",
        intervalSpeed: 2000,
        movesCharacter: false,
        obstacle: {
          length: 2,
          gapLength: 5,
        },
      },
      {
        direction: "right",
        intervalSpeed: 3000,
        movesCharacter: false,
        obstacle: {
          length: 1,
          gapLength: 3,
        },
      },
      {
        direction: "left",
        intervalSpeed: 4000,
        movesCharacter: false,
        obstacle: {
          length: 1,
          gapLength: 3,
        },
      },
      {
        isSafeLane: true,
      },
    ],
  };

  // class name that will be used to identify obstacles
  const obstacleClass = "obstacle";

  // set player's start coordinates based on game config
  const playerPosition = {
    x: Math.floor(game.width / 2),
    y: game.lanes.length - 1,
  };

  // array to hold one array per lane, containing all divs for respective lanes
  const cells = [];

  const timers = [];

  // populate cells array and add divs to document
  function setupGrid() {
    // add rows (lanes)
    for (let y = 0; y < game.lanes.length; y++) {
      const gameLane = game.lanes[y];
      const laneCells = [];
      const laneDiv = document.createElement("div");
      laneDiv.classList.add("lane");

      // add cells to each row
      for (let x = 0; x < game.width; x++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        laneDiv.appendChild(cell);
        laneCells.push(cell);
      }

      cells.push(laneCells);
      grid.appendChild(laneDiv);

      setupObstacles(laneCells, gameLane);
      moveObstacles(laneCells, gameLane);
    }
  }

  // add obstacle to lane
  function setupObstacles(laneCells, gameLane) {
    if (gameLane.isSafeLane) {
      return;
    }
    const obstacleLength = gameLane.obstacle.length;
    const gapLength = gameLane.obstacle.gapLength;

    let remainingObstacleCells = obstacleLength;
    let remainingGapCells = 0;
    for (let i = 0; i < laneCells.length; i++) {
      const cell = laneCells[i];
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
    }
  }

  // set timer to move obstacles in lane
  function moveObstacles(laneCells, gameLane) {
    if (gameLane.isSafeLane) {
      return;
    }

    const timer = setInterval(() => {
      const previousObstacles = laneCells.map((cell) =>
        cell.classList.contains(obstacleClass)
      );

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
    }, gameLane.intervalSpeed);

    timers.push(timer);
    console.log(timers);
  }

  // check keystroke and move player accordingly
  function handleKeyUp(event) {
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
        if (playerPosition.y > 0) {
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

  // checks if player landed on obstacles or reached last lane. if so, end game.
  function evaluatePlayerPosition() {
    if (getPlayerPositionCell().classList.contains(obstacleClass)) {
      console.log("Du loser");
      clearTimers();
    } else if (playerPosition.y === 0) {
      console.log("You won!");
      clearTimers();
    }
  }

  function clearTimers() {
    timers.forEach((timer) => clearInterval(timer));
  }

  // returns div of current player position
  function getPlayerPositionCell() {
    return cells[playerPosition.y][playerPosition.x];
  }

  setupGrid();

  // start listening to key events
  document.addEventListener("keyup", handleKeyUp);

  // move player to initial position
  movePlayer(playerPosition.x, playerPosition.y);
}
document.addEventListener("DOMContentLoaded", init);
