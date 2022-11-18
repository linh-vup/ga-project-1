function init() {
  const grid = document.querySelector(".grid");
  const livesDisplay = document.querySelector("#lives");
  const goalDisplay = document.querySelector("#in-goal");
  const difficultyDisplay = document.querySelector("#difficulty-display");
  const startButton = document.querySelector("#start-game");
  const restartButton = document.querySelector("#restart");
  const settingsIcon = document.querySelector("#settings-icon");
  const closeSettingsIcon = document.querySelector("#close-icon");
  const difficultyForm = document.querySelector("#form-difficulty");
  const radioButtonDefault = document.querySelector("#easy");
  const overlayHeaderOneText = document.querySelector("#overlay-h1");
  const overlayHeaderThreeText = document.querySelector("#overlay-h3");
  const backgroundMusicAudioElement =
    document.querySelector("#background-audio");
  const backgroundSoundAudioElement = document.querySelector(
    "#background-sound-audio"
  );
  const clashSoundAudioElement = document.querySelector("#crash-sound");
  const backgroundMusicToggleButton = document.querySelector("#volume-toggle");
  const backgroundSoundToggleButton = document.querySelector("#sound-toggle");

  // defining game configuration
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
        hasLaneSound: true,
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
        // eslint-disable-next-line comma-dangle
      },
    ],
  };

  //defining game state
  const gameState = {
    state: "running",
    playersInGoal: 0,
    playerLives: 5,
    difficulty: "easy",
    isBackgroundMusicOn: true,
    isBackgroundSoundOn: true,
    isClashSoundOn: true,
    isLaneSoundOn: true,
  };
  // keeps track of player's coordinates
  const playerPosition = {
    x: 0,
    y: 0,
  };

  // class name that will be used to identify obstacles, player and player in goal classes
  const obstacleClass = "obstacle";
  const playerClass = "player";
  const inGoalClass = "playerInGoal";

  // array to hold one array per lane, containing all divs for respective lanes
  const cells = [];

  const timers = [];

  function loadGame() {
    setupGrid();
    setupObstacles();
    moveObstacles(1);
    resetPlayerPosition();
    setupEventListeners();
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
    createGoalLane();
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

  // set intervals to move obstacles in lane
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

    let newX = playerPosition.x;
    let newY = playerPosition.y;

    switch (event.code) {
      case "ArrowRight":
        newX++;
        break;
      case "ArrowLeft":
        newX--;
        break;
      case "ArrowUp":
        newY--;
        break;
      case "ArrowDown":
        newY++;
        break;
      default:
        console.log("invalid key do nothing");
    }

    const isBlocked = cells[newY][newX].classList.contains("blocked-cells");
    const isOutsideGrid = newX > game.width - 1 || newY > game.lanes.length - 1;

    if (!isBlocked && !isOutsideGrid) {
      movePlayer(newX, newY);
    }
  }

  // return div/dom element of current player position
  function getPlayerPositionCell() {
    return cells[playerPosition.y][playerPosition.x];
  }

  // move player to position x, y
  function movePlayer(x, y) {
    getPlayerPositionCell().classList.remove(playerClass);

    playerPosition.x = x;
    playerPosition.y = y;

    getPlayerPositionCell().classList.add(playerClass);
    evaluatePlayerPosition();
    playLaneSound();
  }

  function resetPlayerPosition() {
    movePlayer(Math.floor(game.width / 2), game.lanes.length - 1);
  }

  // check if player landed on obstacles or reached last lane. if so, end game.
  function evaluatePlayerPosition() {
    if (getPlayerPositionCell().classList.contains(obstacleClass)) {
      removePlayerLife();
      playClashSound();
      if (gameState.playerLives > 0) {
        getPlayerPositionCell().setAttribute("id", "clash");
        setTimeout(anotherTurn, 1500);
      } else {
        gameOver();
      }
    } else if (
      getPlayerPositionCell().classList.contains("goal") &&
      !getPlayerPositionCell().classList.contains(inGoalClass)
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

  function removePlayerLife() {
    gameState.playerLives--;
    livesDisplay.innerHTML = gameState.playerLives;
    gameState.state = "paused";
  }

  function addPlayerToGoal() {
    getPlayerPositionCell().classList.add(inGoalClass);
    gameState.playersInGoal++;
    goalDisplay.innerHTML = gameState.playersInGoal;
    gameState.state = "paused";
  }

  function gameOver() {
    clearTimers();
    gameState.state = "lost";
    showGameEndOverlay();
  }

  function gameWon() {
    gameState.state = "won";
    showGameEndOverlay();
    if (gameState.state === "won" && gameState.difficulty === "difficult") {
      unlockUnhingedLevel();
    }
    console.log(gameState.state, gameState.difficulty);
  }

  function unlockUnhingedLevel() {
    document.querySelector("#unhinged-div").style.display = "block";
  }

  function createGoalLane() {
    cells[0].filter((cell, i) => {
      if (i === 3 || i === 6 || i === 9) {
        cell.classList.add("goal");
      } else {
        cell.classList.add("blocked-cells");
      }
    });
  }

  function showSettingsOverlay() {
    document.querySelector("#overlay-settings").style.display = "flex";
  }

  function showGameEndOverlay() {
    document.querySelector("#overlay-game-end").style.display = "flex";
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

  function hideAllOverlays() {
    document.querySelector("#overlay-game-start").style.display = "none";
    document.querySelector("#overlay-game-end").style.display = "none";
    document.querySelector("#overlay-settings").style.display = "none";
  }

  function clearTimers() {
    timers.forEach((timer) => clearInterval(timer));
  }

  function restartGame() {
    hideAllOverlays();
    clearTimers();
    grid
      .querySelectorAll(inGoalClass)
      .forEach((element) => element.classList.remove(inGoalClass));
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

  function chooseDifficulty(event) {
    clearTimers();
    if (document.querySelector("#easy").checked) {
      moveObstacles(1);
      gameState.difficulty = "easy";
      difficultyDisplay.innerHTML = "Easy";
    } else if (document.querySelector("#medium").checked) {
      moveObstacles(0.4);
      gameState.difficulty = "medium";
      difficultyDisplay.innerHTML = "Medium";
    } else if (document.querySelector("#difficult").checked) {
      moveObstacles(0.2);
      gameState.difficulty = "difficult";
      difficultyDisplay.innerHTML = "Difficult";
    } else if (document.querySelector("#unhinged").checked) {
      moveObstacles(0.05);
      gameState.difficulty = "unhinged";
      difficultyDisplay.innerHTML = "Unhinged";
    }
  }

  function playBackgroundMusic(event) {
    backgroundMusicAudioElement.play();
  }

  function playClashSound() {
    clashSoundAudioElement.src = "./sounds/live_lost.mp3";
    if (gameState.isClashSoundOn) {
      clashSoundAudioElement.play();
    }
  }

  function toggleBackgroundMusic(event) {
    if (gameState.isBackgroundMusicOn) {
      backgroundMusicAudioElement.pause();
      backgroundMusicToggleButton.innerHTML = "volume_off";
      gameState.isBackgroundMusicOn = false;
    } else {
      backgroundMusicAudioElement.play();
      backgroundMusicToggleButton.innerHTML = "volume_up";
      gameState.isBackgroundMusicOn = true;
    }
  }

  function toggleBackgroundSound(event) {
    if (gameState.isBackgroundSoundOn) {
      backgroundSoundAudioElement.pause();
      clashSoundAudioElement.pause();
      backgroundSoundToggleButton.innerHTML = "volume_off";
      gameState.isBackgroundSoundOn = false;
      gameState.isLaneSoundOn = false;
      gameState.isClashSoundOn = false;
    } else {
      backgroundSoundAudioElement.play();
      backgroundSoundToggleButton.innerHTML = "volume_up";
      gameState.isBackgroundSoundOn = true;
      gameState.isLaneSoundOn = true;
      gameState.isClashSoundOn = true;
    }
  }

  function playLaneSound() {
    if (game.lanes[playerPosition.y].hasLaneSound) {
      backgroundSoundAudioElement.src = `./sounds/lane-${playerPosition.y}.wav`;
      backgroundSoundAudioElement.play();
    } else {
      backgroundSoundAudioElement.pause();
    }
  }

  function setupEventListeners() {
    document.addEventListener("keyup", handleKeyUp);
    startButton.addEventListener("click", () => {
      hideAllOverlays();
      playBackgroundMusic();
    });
    restartButton.addEventListener("click", restartGame);
    difficultyForm.addEventListener("change", chooseDifficulty);
    settingsIcon.addEventListener("click", showSettingsOverlay);
    closeSettingsIcon.addEventListener("click", hideAllOverlays);
    backgroundMusicToggleButton.addEventListener(
      "click",
      toggleBackgroundMusic
    );
    backgroundSoundToggleButton.addEventListener(
      "click",
      toggleBackgroundSound
    );
    window.addEventListener(
      "keydown",
      function (e) {
        if (
          ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(e.code) >
          -1
        ) {
          e.preventDefault();
        }
      },
      false
    );
  }

  loadGame();
}
document.addEventListener("DOMContentLoaded", init);
