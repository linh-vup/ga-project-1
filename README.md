# Foxxers (Frogger Game) - General Assembly Project 1

[Project Overview](#project-overview) | [Getting Started](#getting-started) | [Project Brief and Timeframe](#project-brief-and-timeframe) | [Brief](#project-brief) | [Technologies used](#tools-and-technologies-used) | [Process](#process) | [Wins](#wins) | [Challenges](#challenges) | [Bugs & Future Improvements](#bugs--future-improvements) | [Other Resources](#other-resources) | [Key Learnings](#key-learnings)

# Project Overview

This was the first solo project of my General Assembly remote Software Engineering Immersive course and my first deployed coding project. The project's task was to pick from a list of games and to develop the game based on the technologies/programming languages we had learnt so far.

I chose to build a game based on Frogger, where the player has to navigate through a grid from one end to another while avoiding obstacles.

# Getting Started

- Clone or download the source code
- Open the index.html file in the browser

Link to deployment: [https://linh-vup.github.io/ga-project-1/](https://linh-vup.github.io/ga-project-1/)

# Project Brief and Timeframe

This project started four weeks into the SEI course and we were given one week to build the game. During that week, the class had daily morning stand-ups. As these were solo projects, I worked independently on the game. The instructors offered help when needed and there were Zoom breakout rooms for each project, where people basing their project on the same game could exchange information.

## Project Brief

Technical Requirements/ App must:

- Render a game in the browser
- Design logic for winning & visually display which player won
- Include separate HTML / CSS / JavaScript files
- Stick with KISS (Keep It Simple Stupid) and DRY (Don't Repeat Yourself) principles
- Use \*\*Javascript for DOM manipulation
- Deploy your game online, where the rest of the world can access it
- Use semantic markup for HTML and CSS (adhere to best practices)

Necessary Deliverables

- A working game, built by you, hosted somewhere on the internet
- A link to your hosted working game in the URL section of your Github repo
- A git repository hosted on Github, with a link to your hosted game, and frequent commits dating back to the very beginning of the project
- A readme.md file with explanations of the technologies used, the approach taken, installation instructions, unsolved problems, etc.

Frogger Game Requirement

- The game should be playable for one player
- The obstacles should be auto generated

# Tools and Technologies Used

- JavaScript (ES6)
- HTML5 with HTML5 audio
- CSS3
- Git/GitHub
- Figma
- Google Chrome dev tools
- Google Fonts
- Canva

# Demonstration

![Game demonstration](./Images/game_walkthrough.gif 'Game Demonstration')

![Game settings](./Images/game_settings.png 'Game Settings')

**Summary of Features:**

- Moving obstacles
- Static obstacles
- Player losing lives when hitting moving obstacle
- Player moving along with the direction on “save obstacles”
- Selection of various difficulty levels
- Turn on/off background music and sounds

# Process

## Planning

I first spent time familiarizing myself with the general game logic and creating a simple mock-up of my game (with Figma), including writing pseudocode for my must-haves before I started setting up the repository.

![Figma mock-up](./Images/figma_mockup.png 'Figma Mock-Up')

## Execution

As a base, I created an object to define the game configurations like the grid width, as well as the number of lanes as nested objects containing key-value pairs which determine the type of lane (e.g. an obstacle lane or a safe lane), the interval speed for the moving obstacles per lane, the direction of obstacle movement etc. This object was amended along the way but made it easier to add dynamic functionality, rather than hard-coding the number of grids.

```javascript
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
//...
```

_The code snippet shows part of the game configuration object, with an array of objects as value for the lanes key (each array element representing one lane)._

The game grid was set up by iterating over the object information, creating the lanes and cells inside each lane according to the given width. If the lane was defined as an obstacle lane, the setupObstacles function would place obstacles by adding an obstacle class to that cell with specified gaps per lane. I added keydown event listeners to enable the player to move and added conditions to restrict player movement outside of the grid and into blocked cells (static obstacles). A permitted movement would trigger the movePlayer function, which removes and adds the CSS class to display the player on the grid accordingly and evaluates the position the player moved to.

```javascript
let newX = playerPosition.x;
let newY = playerPosition.y;

switch (event.code) {
  case 'ArrowRight':
    newX++;
    break;
  case 'ArrowLeft':
    newX--;
    break;
  case 'ArrowUp':
    newY--;
    break;
  case 'ArrowDown':
    newY++;
    break;
  default:
    console.log('invalid key do nothing');
}
```

_The code snippet shows part of `handleKeyUp` function, where I use a switch statement to define the player movement with the arrow keys._

Using for loops over the game configuration object and its settings, obstacle movements were created with interval timers. One particular feature to mention here is that some lanes are defined as `movesCharacter`, which would make the character move along the same direction of the obstacle movement if the user is positioned on a “safe” cell.

```javascript
if (
  gameLane.direction === 'right' &&
  gameLane.movesCharacter &&
  playerPosition.x < laneCells.length - 1 &&
  playerPosition.y === y
) {
  movePlayer(playerPosition.x + 1, playerPosition.y);
}
evaluatePlayerPosition();
```

_The code snippet for setting up obstacle movement when the lane is denied as movescharacter._

An `evaluatePlayerPosition` function evaluates which cell the player has moved to. If moved into an obstacle cell, the user loses a life and gets repositioned (number of lives previously defined in a variable). If the player managed to move into a goal lane the set amount of times, the player won the game. I then also added game settings, where the user can set the difficulty, which would change the interval speed and the gap length between obstacles with a given multiplier. There is an “easter egg”, with which the player can unlock a new “unhinged” difficulty level.

## Styling

- I started implementing some very basic styling early on and later spent a good amount of time styling the grid and obstacles. I used tilesets to style the lanes and various images for the obstacles. I also added background music and sounds.
- I added overlays for the start and end of the game, as well as for the game settings

# Wins

- Initially I was unsure about creating a game as my first coding project, thinking that building games is not what I’m planning to do in the future. However, it turned out to be a very fun way to help me deepen my understanding of JavaScript and DOM manipulation and to apply and strengthen my programmatic thinking and logical problem solving experience
- I used objects and states to make the code work dynamically where possible to avoid hard-coding, which will make it easier for me to add new elements to the game in the future
- I was able to create a fun theme and design for the game (inspired by the foxes in my backyard)

# Challenges

- The app.js file is quite large in terms of lines of code, but at the time I didn’t know how to import code from other files into the app.js file (now I know I can create exports in other files and import into app.js and can change it in a future v2 version)
- Refactoring code as the project moved further, either to amend game configurations or for DRY code. I often had to overcome the “why try fixing things when it’s not broken” approach, especially towards the end of the project as I was afraid to break functioning code

# Bugs & Future Improvements

There’s one known bug (or is it a feature?) left and there are features and stylings that I wanted to implement:

- Bug: when turning off the sounds, the bike bell ringing sound keeps playing, despite the player not being positioned on the lane (other sounds are turned off)
- Add a different sound per lane (currently, I only implemented a bike bell ringing sound for when the user is on the bike obstacle lane)
- Show game settings in the game start overlay (I explicitly moved them into a settings overlay for me to use overlays, but from a UX perspective it would be easier to expose the settings in the games view)
- Export game configurations/specific functions to files and import into app.js
- Refactor more

# Other Resources

- Modern City tile set ([link](https://shatteredreality.itch.io/modern-city))
- Icons/sprites for player and obstacles from giphy.com and Canva
- Music and background sounds: [Resource 1](https://www.chosic.com/download-audio/27248/), [Resource 2](https://pixabay.com/sound-effects/negative-beeps-6008/), [Resource 3](https://freesound.org/people/pallen33/sounds/405628/)

# Key Learnings

Creating a game as the first exercise was a fun way to consolidate everything I’ve learnt so far and I was able to work on the game logic and styles to make the game more engaging. A key learning was that it’s important to break up code into smaller functions and to get the project working step by step, rather than wanting everything to work right away.
