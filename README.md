# Party House - Deckbuilder Game

A JavaScript-based deckbuilder game inspired by Party House from UFO 50!

## Game Overview

Host the ultimate party by gathering guests into your house. Your goal is to host a party with 4 star guests within 25 rounds!

### Game Mechanics

- **Two Currencies**: Popularity and Cash
- **House Capacity**: Starts at 5, can be upgraded with cash
- **25 Rounds**: Complete your objective before time runs out!

### Game Phases

1. **Party Phase**: 
   - Click the door button to invite random guests from your guest list
   - Each guest has popularity, cash, trouble, and star values
   - If 3 troubles are in the house at once, the party ends immediately!
   - Try to fill your house or maximize rewards before ending the round

2. **Shop Phase**:
   - Use popularity to buy new guests (adds them to your guest list)
   - Use cash to upgrade your house capacity
   - Prepare for the next round!

### Win Condition

Get 4 star guests in your party at the end of a round before round 25!

## Project Structure

```
party-house-game/
├── index.html          # Main HTML file
├── styles.css          # Styling
├── js/
│   ├── game.js        # Main game controller
│   ├── gameState.js   # Game state management
│   ├── guest.js       # Guest system and definitions
│   └── ui.js          # UI controller
└── README.md          # This file
```

## How to Run

1. Open `index.html` in a modern web browser
2. Click "Start Game" to begin
3. Enjoy!

## Guest Types

The game includes various guest types with unique abilities:

- **Basic Guests**: Standard party guests
- **Star Guests**: Required for victory!
- **Troublemakers**: Cause trouble (watch out!)
- **Musicians & Dancers**: Synergy bonuses when together
- **Socialites**: Auto-invite other guests
- **Party Planners**: Reshuffle the party
- **Celebrities**: High-value star guests
- **Investors**: Generate lots of cash
- **Influencers**: Generate lots of popularity

## Extending the Game

The modular guest system makes it easy to add new guest types:

1. Add a new definition to `GuestDefinitions` in `js/guest.js`
2. Add the guest to the shop pool in `gameState.js`
3. Implement custom abilities in the `Guest` class `executeAbilities` method

## Browser Compatibility

Requires a modern browser with ES6 module support (Chrome, Firefox, Safari, Edge).

