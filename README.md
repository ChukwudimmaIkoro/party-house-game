# Party Deck - Deckbuilder Game

A JavaScript-based deckbuilder game inspired by Party House from UFO 50!

## Game Overview

Host the ultimate party by gathering guests into your house. Your goal is to host a party with 4 star guests within 25 rounds!

### How to Play

The game occurs over 25 rounds, and each round consists of two phases:

1. **Party Phase**: 
   - Click the door button to invite random guests from your guest list!
   - Each guest has different values, whether it be Popularity, Cash, or Trouble. Some guests also have unique effects.
   - If 3 troubles are in the house at once, the party ends immediately and you lose all potential earnings for the round!
   - Try to fill your house or maximize rewards before ending the round, will you risk the reward?

2. **Shop Phase**:
   - Use the Popularity you earn to add new guests to your guest list
   - Use cash to upgrade your house's maximum capacity. A bigger house means more guests you can invite per round!
   - Finally, prepare for the next round!

   When you start a game, you initially have 10 guests in your list: 4 Old Friends (1 Pop), 3 Rich Friends (1 Cash), and 3 Troublemakers (2 Pop, Trouble).

### Win Condition

End a round with at least 4 Star guests in your party by round 25!

## Guest Types

The game includes various guest types with unique attributes:

- **Basic Guests**: Standard party guests (don't take them for granted)
- **Star Guests**: Required for victory!
- **Trouble Guests**: Guests that are often high value, but beware! If three are in your party at the same time, the round automatically ends without earning anything!
- **Synergy Guests**: Guests that provide bonus Popularity/Cash when combined with another mechanic/guest (Dancers, Comedians, etc)
- **Passive-Ability Guests**: Guests that provide an effect as long as they are currently present at your party
- **Auto-Ability Guests**: Guests that automatically trigger an effect upon arrival
- **Manual-Ability Guests**: Guests that have an ability that can be triggered by the player at any time during the round

### Tips and Tricks

- Don't be afraid to end a party, especially if Trouble shows up early.
- Keep track of how many guests you add to your list. While it can increase earnings early, a large guest list may make it harder to find the guests you want later.
- Consider synergies! Some guests work well with each other and can help increase profit.

## Project Structure

```
party-house-game/
├── index.html          # Main HTML file
├── styles.css          # CSS Style File
├── js/
│   ├── game.js        # Main game controller
│   ├── gameState.js   # Game state manager
│   ├── guest.js       # Guest system and definitions
│   └── ui.js          # UI controller
└── README.md          # Instructions/ Summary
```

## How to Run

1. Open `index.html` in a modern web browser
2. Click "Start Game" to begin
3. Enjoy!

## Extending the Game

The modular guest system makes it easy to add new guest types:

1. Add a new definition to `GuestDefinitions` in `js/guest.js`
2. Add the guest to the shop pool in `gameState.js`
3. Implement custom abilities in the `Guest` class `executeAbilities` method

- I've currently added functionality for about 1 scenario's worth of guests, more to be added soon!

## Browser Compatibility

Requires a modern browser with ES6 module support (Chrome, Firefox, Safari, Edge).

