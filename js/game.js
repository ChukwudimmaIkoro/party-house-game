/**
 * Main Game Controller - Ties everything together
 */

import { GameState } from './gameState.js';
import { UIController } from './ui.js';
import { createGuest } from './guest.js';

class Game {
    constructor() {
        this.gameState = new GameState();
        this.ui = new UIController();
        this.setupUICallbacks();
    }

    setupUICallbacks() {
        // Start game
        this.ui.onStartGame = () => {
            this.startGame();
        };

        // End game
        this.ui.onEndGame = () => {
            this.endGame(false, 'Game ended by player.');
        };

        // Door button click
        this.ui.onDoorClick = () => {
            this.handleDoorClick();
        };

        // End round manually
        this.ui.onEndRound = () => {
            this.endPartyPhase();
        };

        // Next round
        this.ui.onNextRound = () => {
            this.startNextRound();
        };

        // Buy guest
        this.ui.onBuyGuest = (guestKey) => {
            this.buyGuest(guestKey);
        };

        // Upgrade capacity
        this.ui.onUpgradeCapacity = () => {
            this.upgradeCapacity();
        };

        // Guest abilities
        this.ui.onUseReshuffle = (guestId) => {
            this.useReshuffleAbility(guestId);
        };

        this.ui.onUseKick = (guestId) => {
            this.useKickAbility(guestId);
        };

        this.ui.onUseInvite = (guestId) => {
            this.useInviteAbility(guestId);
        };

        // Restart game
        this.ui.onRestartGame = () => {
            this.startGame();
        };
    }

    startGame() {
        this.gameState.reset();
        this.updateUI();
        this.ui.showPhase('party');
        this.updateWinStreakDisplay();
    }

    handleDoorClick() {
        // Check if house is full - auto-end party phase
        if (this.gameState.houseGuests.length >= this.gameState.houseCapacity) {
            // House is full, automatically end party phase
            setTimeout(() => {
                this.endPartyPhase(false); // false = not trouble ended
            }, 100);
            return;
        }

        // Get random guest from guest list
        const guestTemplate = this.gameState.getRandomGuestFromList();
        if (!guestTemplate) {
            alert('No guests available in guest list!');
            return;
        }

        // Create a copy of the guest to add to house
        // If guestTemplate is already a Guest instance, clone it; otherwise create from key
        let guestCopy;
        if (guestTemplate instanceof Object && guestTemplate.id) {
            // It's already a Guest instance, create a new one from its id
            guestCopy = createGuest(guestTemplate.id);
        } else {
            // It's a key string
            guestCopy = createGuest(guestTemplate);
        }
        
        // Add guest to house
        const added = this.gameState.addGuestToHouse(guestCopy);
        if (!added) {
            return;
        }

        // Execute guest abilities
        const effects = guestCopy.executeAbilities(this.gameState, this.gameState.houseGuests);
        
        // Handle effects
        this.handleGuestEffects(effects);

        // Check if house is now full after effects (auto-invites might fill it)
        if (this.gameState.houseGuests.length >= this.gameState.houseCapacity) {
            // House is full, automatically end party phase
            setTimeout(() => {
                this.endPartyPhase(false); // false = not trouble ended
            }, 100);
            this.updateUI();
            return;
        }

        // Check for trouble
        if (this.gameState.checkTrouble()) {
            // Party ends immediately due to trouble
            setTimeout(() => {
                alert('Party ended! Three troubles detected!');
                this.endPartyPhase(true); // true = trouble ended
            }, 100);
        }

        this.updateUI();
    }

    handleGuestEffects(effects) {
        // Handle auto-invites
        if (effects.invite && effects.invite.length > 0) {
            effects.invite.forEach(guestToInvite => {
                if (this.gameState.houseGuests.length < this.gameState.houseCapacity) {
                    let invitedGuest;
                    if (guestToInvite instanceof Object && guestToInvite.id) {
                        invitedGuest = createGuest(guestToInvite.id);
                    } else {
                        invitedGuest = createGuest(guestToInvite);
                    }
                    this.gameState.addGuestToHouse(invitedGuest);
                }
            });
        }

        // Handle reshuffle
        if (effects.reshuffle) {
            // Reshuffle house guests (randomize order)
            this.gameState.houseGuests = this.gameState.houseGuests.sort(() => Math.random() - 0.5);
        }

        // Handle modifications
        if (effects.modify && effects.modify.length > 0) {
            effects.modify.forEach(mod => {
                if (mod.target === 'self') {
                    // Modify the guest that triggered the ability
                    // This would need to be tracked
                } else {
                    // Modify other guests
                    const targetGuest = this.gameState.houseGuests.find(g => g.id === mod.target);
                    if (targetGuest && mod.property) {
                        targetGuest[mod.property] = (targetGuest[mod.property] || 0) + mod.value;
                    }
                }
            });
        }
    }

    endPartyPhase(troubleEnded = false) {
        if (troubleEnded) {
            // No rewards if trouble ended the party
            this.gameState.houseGuests = [];
            // Move to shop phase
            this.gameState.isPartyPhase = false;
            this.ui.showPhase('shop');
            this.updateUI();
        } else {
            // Check win condition before ending phase (while guests are still in house)
            const starCount = this.gameState.getStarCount();
            if (starCount >= 4) {
                this.endGame(true, 'You hosted the ultimate party!');
                return;
            }
            
            // Collect rewards
            const rewards = this.gameState.endPartyPhase();
            
            // Show results tally to user
            this.showResultsTally(rewards);
        }
    }
    
    showResultsTally(rewards) {
        // Create a modal or alert showing the results
        const message = `Party Results:\n\n` +
            `⭐ Popularity Earned: ${rewards.popularity}\n` +
            `💰 Cash Earned: ${rewards.cash}\n` +
            `✨ Stars: ${rewards.starCount} / 4\n\n` +
            `Proceeding to shop phase...`;
        
        alert(message);
        
        // Move to shop phase after showing results
        this.gameState.isPartyPhase = false;
        this.ui.showPhase('shop');
        this.updateUI();
    }

    startNextRound() {
        // Check lose condition
        if (this.gameState.checkLoseCondition()) {
            this.endGame(false, `Game Over! You didn't reach 4 star guests within 25 rounds.`);
            return;
        }

        this.gameState.startNextRound();
        this.ui.showPhase('party');
        this.updateUI();
    }

    buyGuest(guestKey) {
        const success = this.gameState.buyGuest(guestKey);
        if (success) {
            this.updateUI();
        } else {
            alert('Not enough popularity!');
        }
    }

    upgradeCapacity() {
        if (this.gameState.houseCapacity >= 35) {
            alert('House capacity is at maximum (35)!');
            return;
        }
        const success = this.gameState.upgradeCapacity();
        if (success) {
            this.updateUI();
        } else {
            alert('Not enough cash!');
        }
    }

    useReshuffleAbility(guestId) {
        // Check if ability already used by any guest of this type
        const guest = this.gameState.houseGuests.find(g => g.id === guestId);
        if (!guest) return;
        
        // Check if any guest of this type has used the ability
        if (this.gameState.hasUsedAbility(guestId, 'manualReshuffle')) {
            alert('This ability has already been used this party!');
            return;
        }

        // Mark ability as used for this guest type
        this.gameState.markAbilityUsed(guestId, 'manualReshuffle');

        // Reset party list - clear house (guests go back to pool)
        this.gameState.houseGuests = [];
        
        alert('Party reshuffled! All guests have been removed from the house. You can invite them again.');
        this.updateUI();
    }

    useKickAbility(guestId) {
        // Find the bouncer guest
        const bouncer = this.gameState.houseGuests.find(g => g.id === guestId && g.id === 'bouncer');
        if (!bouncer) {
            return;
        }

        // Get list of other guests (can't kick self)
        const otherGuests = this.gameState.houseGuests.filter(g => g.id !== guestId);
        if (otherGuests.length === 0) {
            alert('No other guests to kick!');
            return;
        }

        // Show selection dialog
        const guestNames = otherGuests.map((g, idx) => `${idx + 1}. ${g.name}`).join('\n');
        const selection = prompt(`Select a guest to kick:\n\n${guestNames}\n\nEnter number (1-${otherGuests.length}):`);
        
        if (!selection) return;
        
        const index = parseInt(selection) - 1;
        if (isNaN(index) || index < 0 || index >= otherGuests.length) {
            alert('Invalid selection!');
            return;
        }

        const guestToKick = otherGuests[index];
        
        // Remove guest from house (they don't go back to pool for this phase)
        const kickIndex = this.gameState.houseGuests.findIndex(g => 
            g.id === guestToKick.id && 
            g.name === guestToKick.name
        );
        if (kickIndex !== -1) {
            this.gameState.houseGuests.splice(kickIndex, 1);
            // Mark as kicked so they don't appear in pool for this phase
            this.gameState.kickedGuests.push(guestToKick.id);
        }

        // Check if this causes instant loss
        const newTroubleCount = this.gameState.getRawTroubleCount();
        const newHasDog = this.gameState.houseGuests.some(g => g.id === 'dog');
        const effectiveTrouble = newHasDog ? Math.max(0, newTroubleCount - 1) : newTroubleCount;
        
        if (effectiveTrouble >= 3) {
            alert(`${guestToKick.name} has been kicked! Party ended due to too much trouble!`);
            setTimeout(() => {
                this.endPartyPhase(true); // true = trouble ended
            }, 100);
            return;
        }

        alert(`${guestToKick.name} has been kicked from the party!`);
        this.updateUI();
    }

    useInviteAbility(guestId) {
        // Find the driver guest
        const driver = this.gameState.houseGuests.find(g => g.id === guestId && g.id === 'driver');
        if (!driver) {
            return;
        }

        // Check if house is full
        if (this.gameState.houseGuests.length >= this.gameState.houseCapacity) {
            alert('House is at full capacity!');
            return;
        }

        // Get available guests from guest list (pool)
        // Exclude guests already in house and kicked guests
        const availableGuests = this.gameState.guestList.filter(g => 
            !this.gameState.houseGuests.some(hg => hg.id === g.id) &&
            !this.gameState.kickedGuests.includes(g.id)
        );

        if (availableGuests.length === 0) {
            alert('No guests available in pool!');
            return;
        }

        // Show selection dialog
        const guestNames = availableGuests.map((g, idx) => `${idx + 1}. ${g.name}`).join('\n');
        const selection = prompt(`Select a guest to invite:\n\n${guestNames}\n\nEnter number (1-${availableGuests.length}):`);
        
        if (!selection) return;
        
        const index = parseInt(selection) - 1;
        if (isNaN(index) || index < 0 || index >= availableGuests.length) {
            alert('Invalid selection!');
            return;
        }

        const guestToInvite = availableGuests[index];
        
        // Create a copy and add to house
        const invitedGuest = createGuest(guestToInvite.id);
        const added = this.gameState.addGuestToHouse(invitedGuest);
        
        if (!added) {
            alert('Could not add guest!');
            return;
        }

        // Execute guest abilities
        const effects = invitedGuest.executeAbilities(this.gameState, this.gameState.houseGuests);
        this.handleGuestEffects(effects);

        // Check if house is now full
        if (this.gameState.houseGuests.length >= this.gameState.houseCapacity) {
            setTimeout(() => {
                this.endPartyPhase(false);
            }, 100);
            this.updateUI();
            return;
        }

        // Check for trouble
        if (this.gameState.checkTrouble()) {
            setTimeout(() => {
                alert('Party ended! Three troubles detected!');
                this.endPartyPhase(true);
            }, 100);
        }

        this.updateUI();
    }

    endGame(won, message) {
        // Handle win streak
        if (won) {
            this.updateWinStreak(true);
            // Show simple win message and return to title screen
            alert('You WIN!');
            setTimeout(() => {
                this.ui.showScreen('main');
                this.updateWinStreakDisplay();
            }, 100);
        } else {
            // Reset win streak on loss
            this.updateWinStreak(false);
            // Show game over message and return to title screen
            alert('Game Over');
            setTimeout(() => {
                this.ui.showScreen('main');
                this.updateWinStreakDisplay();
            }, 100);
        }
    }
    
    /**
     * Update win streak based on game result
     */
    updateWinStreak(won) {
        let winStreak = parseInt(localStorage.getItem('partyHouseWinStreak') || '0');
        
        if (won) {
            winStreak++;
        } else {
            winStreak = 0; // Reset on loss
        }
        
        localStorage.setItem('partyHouseWinStreak', winStreak.toString());
    }
    
    /**
     * Update win streak display on main menu
     */
    updateWinStreakDisplay() {
        const winStreak = parseInt(localStorage.getItem('partyHouseWinStreak') || '0');
        if (this.ui.elements.winStreakCount) {
            this.ui.elements.winStreakCount.textContent = winStreak;
        }
    }

    updateUI() {
        // Update game stats
        this.ui.updateGameStats(this.gameState);
        
        // Update house guests (pass gameState for ability buttons)
        this.ui.updateHouseGuests(this.gameState.houseGuests, this.gameState);
        
        // Update guest list (show available counts)
        this.ui.updateGuestList(this.gameState.guestList, this.gameState);
        
        // Update trouble warning
        this.ui.updateTroubleWarning(this.gameState.getTroubleCount());
        
        // Update capacity display
        this.ui.elements.maxCapacityDisplay.textContent = this.gameState.houseCapacity;
        
        // Update door button state - check if there are available guests
        const availableGuests = this.gameState.getAvailableGuests();
        const canInvite = this.gameState.houseGuests.length < this.gameState.houseCapacity && 
                         availableGuests.length > 0 &&
                         this.gameState.isPartyPhase;
        this.ui.updateDoorButton(canInvite);
        
        // Update shop if in shop phase
        if (!this.gameState.isPartyPhase) {
            this.ui.updateShop(this.gameState.shopGuests, this.gameState);
        }
    }
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    window.game = game; // For debugging
    
    // Initialize win streak display
    game.updateWinStreakDisplay();
});

