/**
 * Main Game Controller - Ties everything together
 */

import { GameState } from './gameState.js';
import { UIController } from './ui.js';
import { createGuest, GuestDefinitions } from './guest.js';

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

        this.ui.onUsePeek = (guestId) => {
            this.usePeekAbility(guestId);
        };

        // Restart game
        this.ui.onRestartGame = () => {
            this.startGame();
        };
    }

    startGame() {
        this.gameState.reset();
        // Pre-select the first guest
        this.gameState.selectNextGuest();
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

        // Get the pre-selected next guest
        const guestTemplate = this.gameState.getNextGuest();
        if (!guestTemplate) {
            alert('⚠️ No more guests available to invite!');
            return;
        }

        // Create a copy of the guest to add to house
        const guestCopy = createGuest(guestTemplate.id);
        
        // Add guest to house
        const added = this.gameState.addGuestToHouse(guestCopy);
        if (!added) {
            return;
        }

        // Execute guest abilities
        const effects = guestCopy.executeAbilities(this.gameState, this.gameState.houseGuests);
        
        // Handle effects
        this.handleGuestEffects(effects);

        // Pre-select the next guest for future invitations
        this.gameState.selectNextGuest();

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
                    const invitedGuest = createGuest(guestToInvite.id || guestToInvite);
                    this.gameState.addGuestToHouse(invitedGuest);
                }
            });
            // Re-select next guest after auto-invites
            this.gameState.selectNextGuest();
        }

        // Handle reshuffle
        if (effects.reshuffle) {
            // Reshuffle house guests (randomize order)
            this.gameState.houseGuests = this.gameState.houseGuests.sort(() => Math.random() - 0.5);
        }

        // Handle modifications
        if (effects.modify && effects.modify.length > 0) {
            // Special handling for dancer synergy - update all dancers
            const hasDancerSynergy = effects.modify.some(mod => mod.isDancerSynergy);
            
            if (hasDancerSynergy) {
                // Count all dancers in house
                const dancers = this.gameState.houseGuests.filter(g => g.id === 'dancer');
                const dancerCount = dancers.length;
                
                if (dancerCount > 0) {
                    // Calculate exponential multiplier: numberOfDancers^2
                    const multiplier = dancerCount;
                    
                    // Update all dancers with exponential values
                    dancers.forEach(dancer => {
                        dancer.popularity = multiplier;
                    });
                }
            } else if (hasComedianSynergy) {
                // Count all comedians in house
                const comedians = this.gameState.houseGuests.filter(g => g.id === 'comedian');
                const comedianCount = comedians.length;
                
                if (comedianCount > 0 && isHouseFull) {
                    // Calculate comedian multiplier
                    const multiplier = comedianCount * 5;
                    comedians.forEach(comedian => {
                        comedian.popularity = multiplier;
                    });
                }
            } else {
                // Standard modification handling
                effects.modify.forEach(mod => {
                    if (mod.target === 'self') {
                        // Modify the guest that triggered the ability
                        const triggeringGuest = this.gameState.houseGuests[this.gameState.houseGuests.length - 1];
                        if (triggeringGuest && mod.property) {
                            triggeringGuest[mod.property] = (triggeringGuest[mod.property] || 0) + mod.value;
                        }
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
    }

    endPartyPhase(troubleEnded = false) {
        // Check win condition BEFORE trouble check (trouble takes precedence)
        // Only check win if party ended normally (not due to trouble)
        if (!troubleEnded) {
            const starCount = this.gameState.getStarCount();
            if (starCount >= 4) {
                this.endGame(true, 'You hosted the ultimate party!');
                return;
            }
        }
        
        if (troubleEnded) {
            // No rewards if trouble ended the party (trouble takes precedence over stars)
            this.gameState.houseGuests = [];
            // Move to shop phase with transition
            this.gameState.isPartyPhase = false;
            this.ui.showPhase('shop');
            // Update UI after transition completes
            setTimeout(() => {
                this.updateUI();
            }, 1200);
        } else {
            // Collect rewards
            const rewards = this.gameState.endPartyPhase();
            
            // Animate stats that changed
            this.ui.animateSpecificStat('popularity', this.gameState.popularity);
            this.ui.animateSpecificStat('cash', this.gameState.cash);
            
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
        
        // Show alert first
        alert(message);
        
        // After alert closes, start transition to shop phase
        // Use setTimeout to ensure alert has fully closed and browser can render
        setTimeout(() => {
            this.gameState.isPartyPhase = false;
            this.ui.showPhase('shop');
            
            // Update UI after transition completes
            setTimeout(() => {
                this.updateUI();
            }, 1200);
        }, 100);
    }

    startNextRound() {
        // Check lose condition
        if (this.gameState.checkLoseCondition()) {
            this.endGame(false, `Game Over! You didn't reach 4 star guests within 25 rounds.`);
            return;
        }

        this.gameState.startNextRound();
        // Start transition to party phase
        this.ui.showPhase('party');
        // Update UI after transition completes
        setTimeout(() => {
            this.updateUI();
        }, 1500);
    }

    buyGuest(guestKey) {
        // Double-check that purchase is valid (button should be disabled, but safety check)
        const guestDef = GuestDefinitions[guestKey];
        if (!guestDef) return;
        
        const canPurchase = this.gameState.canPurchaseGuest(guestKey);
        if (this.gameState.popularity < guestDef.cost || !canPurchase) {
            // Button should be disabled, but if somehow called, just return silently
            return;
        }
        
        const success = this.gameState.buyGuest(guestKey);
        if (success) {
            // Animate the specific stat that changed
            this.ui.animateSpecificStat('popularity', this.gameState.popularity);
            this.updateUI();
        }
        // No alert - button should never be clickable when disabled
    }

    upgradeCapacity() {
        if (this.gameState.houseCapacity >= 35) {
            alert('House capacity is at maximum (35)!');
            return;
        }
        const success = this.gameState.upgradeCapacity();
        if (success) {
            // Animate the specific stat that changed
            this.ui.animateSpecificStat('capacity', this.gameState.houseCapacity);
            this.ui.animateSpecificStat('cash', this.gameState.cash);
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
            
            // Re-select next guest in case the pool changed
            this.gameState.selectNextGuest();
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
        const driver = this.gameState.houseGuests.find(g => g.id === 'driver' && g.id === guestId);
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
        
        // Pre-select the next guest for future invitations
        this.gameState.selectNextGuest();

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

    usePeekAbility(instanceId) {
        // Find the specific guest instance by instanceId
        const watchdog = this.gameState.houseGuests.find(g => g.instanceId === instanceId);
        if (!watchdog || watchdog.id !== 'watchdog') {
            return;
        }
        
        // Check if this specific instance has already used the ability
        if (this.gameState.hasInstanceUsedAbility(watchdog.instanceId, 'peek')) {
            return; // Button should be disabled, but just in case
        }

        // Mark ability as used for this specific instance
        this.gameState.markInstanceAbilityUsed(watchdog.instanceId, 'peek');

        // Get the pre-selected next guest
        const nextGuest = this.gameState.getNextGuest();
        
        if (!nextGuest) {
            alert('⚠️ No more guests available to peek at!\n\nThe guest pool is empty.');
            return;
        }

        // Show the next guest information
        const guestInfo = `Next Guest Preview:\n\n` +
            `Name: ${nextGuest.name}\n` +
            `⭐ Popularity: ${nextGuest.popularity || 0}\n` +
            `💰 Cash: ${nextGuest.cash || 0}\n` +
            `${nextGuest.trouble > 0 ? `⚠️ Trouble: ${nextGuest.trouble}\n` : ''}` +
            `${nextGuest.star > 0 ? `✨ Star: ${nextGuest.star}\n` : ''}` +
            `${nextGuest.description ? `\n${nextGuest.description}` : ''}`;
        
        alert(guestInfo);
        
        // Update UI to disable the button for this specific guest
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
        
        // Update door button state - check if there are available guests and next guest is selected
        const canInvite = this.gameState.houseGuests.length < this.gameState.houseCapacity && 
                         this.gameState.hasMoreGuests() &&
                         this.gameState.isPartyPhase;
        this.ui.updateDoorButton(canInvite);
        
        // Update door button text to show if no more guests
        if (this.gameState.isPartyPhase && !this.gameState.hasMoreGuests()) {
            this.ui.updateDoorButtonText('⚠️ No More Guests');
        } else if (this.gameState.isPartyPhase) {
            this.ui.updateDoorButtonText('🎪 Open Door');
        }
        
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

