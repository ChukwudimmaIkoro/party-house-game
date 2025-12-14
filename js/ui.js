/**
 * UI Controller - Handles all UI updates and interactions
 */

import { GuestDefinitions } from './guest.js';

export class UIController {
    constructor() {
        this.elements = this.initializeElements();
        this.setupEventListeners();
    }

    initializeElements() {
        return {
            // Screens
            mainMenu: document.getElementById('main-menu'),
            instructionsScreen: document.getElementById('instructions-screen'),
            gameScreen: document.getElementById('game-screen'),
            gameOverScreen: document.getElementById('game-over-screen'),
            
            // Menu buttons
            startGameBtn: document.getElementById('start-game-btn'),
            instructionsBtn: document.getElementById('instructions-btn'),
            backToMenuBtn: document.getElementById('back-to-menu-btn'),
            winStreakDisplay: document.getElementById('win-streak-display'),
            winStreakCount: document.getElementById('win-streak-count'),
            
            // Game header
            roundDisplay: document.getElementById('round-display'),
            popularityDisplay: document.getElementById('popularity-display'),
            cashDisplay: document.getElementById('cash-display'),
            capacityDisplay: document.getElementById('capacity-display'),
            starsDisplay: document.getElementById('stars-display'),
            endGameBtn: document.getElementById('end-game-btn'),
            
            // Party phase
            partyPhase: document.getElementById('party-phase'),
            doorButton: document.getElementById('door-button'),
            endRoundBtn: document.getElementById('end-round-btn'),
            houseGuests: document.getElementById('house-guests'),
            currentGuestsCount: document.getElementById('current-guests-count'),
            maxCapacityDisplay: document.getElementById('max-capacity-display'),
            troubleCount: document.getElementById('trouble-count'),
            guestList: document.getElementById('guest-list'),
            
            // Shop phase
            shopPhase: document.getElementById('shop-phase'),
            nextRoundBtn: document.getElementById('next-round-btn'),
            shopGuests: document.getElementById('shop-guests'),
            capacityCost: document.getElementById('capacity-cost'),
            upgradeCapacityBtn: document.getElementById('upgrade-capacity-btn'),
            
            // Game over
            gameOverTitle: document.getElementById('game-over-title'),
            gameOverMessage: document.getElementById('game-over-message'),
            restartGameBtn: document.getElementById('restart-game-btn'),
            mainMenuBtn: document.getElementById('main-menu-btn')
        };
    }

    setupEventListeners() {
        // Menu navigation
        this.elements.startGameBtn.addEventListener('click', () => {
            this.addButtonBounce(this.elements.startGameBtn);
            this.showScreen('game');
            if (this.onStartGame) this.onStartGame();
        });
        
        this.elements.instructionsBtn.addEventListener('click', () => {
            this.addButtonBounce(this.elements.instructionsBtn);
            this.showScreen('instructions');
        });
        
        this.elements.backToMenuBtn.addEventListener('click', () => {
            this.addButtonBounce(this.elements.backToMenuBtn);
            this.showScreen('main');
        });
        
        // Game controls
        this.elements.endGameBtn.addEventListener('click', () => {
            if (this.onEndGame) this.onEndGame();
        });
        
        this.elements.doorButton.addEventListener('click', () => {
            this.addButtonBounce(this.elements.doorButton);
            if (this.onDoorClick) this.onDoorClick();
        });
        
        this.elements.endRoundBtn.addEventListener('click', () => {
            this.addButtonBounce(this.elements.endRoundBtn);
            if (this.onEndRound) this.onEndRound();
        });
        
        this.elements.nextRoundBtn.addEventListener('click', () => {
            this.addButtonBounce(this.elements.nextRoundBtn);
            if (this.onNextRound) this.onNextRound();
        });
        
        this.elements.upgradeCapacityBtn.addEventListener('click', () => {
            this.addButtonBounce(this.elements.upgradeCapacityBtn);
            if (this.onUpgradeCapacity) this.onUpgradeCapacity();
        });
        
        // Game over
        this.elements.restartGameBtn.addEventListener('click', () => {
            this.showScreen('game');
            if (this.onRestartGame) this.onRestartGame();
        });
        
        this.elements.mainMenuBtn.addEventListener('click', () => {
            this.showScreen('main');
        });
    }

    showScreen(screenName) {
        // Hide all screens
        this.elements.mainMenu.classList.remove('active');
        this.elements.instructionsScreen.classList.remove('active');
        this.elements.gameScreen.classList.remove('active');
        this.elements.gameOverScreen.classList.remove('active');
        
        // Show requested screen
        switch(screenName) {
            case 'main':
                this.elements.mainMenu.classList.add('active');
                break;
            case 'instructions':
                this.elements.instructionsScreen.classList.add('active');
                break;
            case 'game':
                this.elements.gameScreen.classList.add('active');
                break;
            case 'gameOver':
                this.elements.gameOverScreen.classList.add('active');
                break;
        }
    }

    showPhase(phaseName) {
        // Smooth phase transition with wipe fade
        const currentPhase = this.elements.partyPhase.classList.contains('active') ? 'party' : 
                            this.elements.shopPhase.classList.contains('active') ? 'shop' : null;
        
        if (currentPhase === phaseName) return;
        
        // Create or get transition overlay
        let overlay = document.getElementById('phase-transition-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'phase-transition-overlay';
            overlay.className = 'phase-transition-overlay';
            document.body.appendChild(overlay);
        }
        
        // Start wipe animation
        overlay.classList.add('wiping');
        
        // Halfway through animation, switch phases
        setTimeout(() => {
            // Remove old phase
            this.elements.partyPhase.classList.remove('active');
            this.elements.shopPhase.classList.remove('active');
            
            // Add new phase
            if (phaseName === 'party') {
                this.elements.partyPhase.classList.add('active');
            } else if (phaseName === 'shop') {
                this.elements.shopPhase.classList.add('active');
            }
        }, 600); // Switch at midpoint (1.2s / 2 = 0.6s)
        
        // Remove overlay after animation completes
        setTimeout(() => {
            overlay.classList.remove('wiping');
            // Reset for next transition
            setTimeout(() => {
                overlay.style.transform = 'translateX(-100%)';
            }, 100);
        }, 1200);
    }

    updateGameStats(gameState) {
        // Update stat values without animation (only animate on specific changes)
        this.elements.roundDisplay.textContent = `${gameState.currentRound} / ${gameState.maxRounds}`;
        this.elements.popularityDisplay.textContent = gameState.popularity;
        this.elements.cashDisplay.textContent = gameState.cash;
        this.elements.capacityDisplay.textContent = gameState.houseCapacity;
        this.elements.starsDisplay.textContent = `${gameState.starCount} / 4`;
    }
    
    // Animate a specific stat when it changes with wobbly text effect
    animateSpecificStat(statName, newValue) {
        let element;
        switch(statName) {
            case 'popularity':
                element = this.elements.popularityDisplay;
                break;
            case 'cash':
                element = this.elements.cashDisplay;
                break;
            case 'capacity':
                element = this.elements.capacityDisplay;
                break;
            case 'stars':
                element = this.elements.starsDisplay;
                break;
            default:
                return;
        }
        
        if (element && element.textContent !== String(newValue)) {
            const oldValue = element.textContent;
            element.style.animation = 'none';
            
            // Add wobble class for text animation
            element.classList.add('wobble-text');
            
            setTimeout(() => {
                element.textContent = newValue;
                element.style.animation = 'statChange 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
                
                // Create particle burst effect
                this.createParticleBurst(element);
                
                // Remove wobble class after animation
                setTimeout(() => {
                    element.classList.remove('wobble-text');
                }, 400);
            }, 10);
        }
    }
    
    // Create particle burst effect at element position
    createParticleBurst(element) {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Create 8 particles in a circle
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const distance = 30 + Math.random() * 20;
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = centerX + 'px';
            particle.style.top = centerY + 'px';
            particle.style.setProperty('--angle', angle + 'rad');
            particle.style.setProperty('--distance', distance + 'px');
            
            // Animate particle
            const endX = centerX + Math.cos(angle) * distance;
            const endY = centerY + Math.sin(angle) * distance;
            
            document.body.appendChild(particle);
            
            // Animate particle movement
            particle.animate([
                { transform: 'translate(0, 0) scale(0)', opacity: 1 },
                { transform: `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) scale(1)`, opacity: 0.8 },
                { transform: `translate(${Math.cos(angle) * distance * 1.5}px, ${Math.sin(angle) * distance * 1.5}px) scale(0)`, opacity: 0 }
            ], {
                duration: 800,
                easing: 'ease-out'
            }).onfinish = () => particle.remove();
        }
    }
    
    // Show +1 popup for upgrades or purchases
    showPlusOnePopup(element, color = 'green', isStar = false) {
        const rect = element.getBoundingClientRect();
        const popup = document.createElement('div');
        popup.className = 'plus-one-popup';
        popup.style.position = 'fixed';
        popup.style.left = rect.left + rect.width / 2 + 'px';
        popup.style.top = rect.top + 'px';
        popup.style.color = color;
        popup.textContent = '+1';
        
        if (isStar) {
            popup.innerHTML = '+1 <span class="star-icon">✨</span>';
            popup.classList.add('star-popup');
        }
        
        document.body.appendChild(popup);
        
        // Animate popup
        popup.animate([
            { transform: 'translate(-50%, 0) scale(0)', opacity: 0 },
            { transform: 'translate(-50%, -20px) scale(1.2)', opacity: 1, offset: 0.3 },
            { transform: 'translate(-50%, -40px) scale(1)', opacity: 1, offset: 0.6 },
            { transform: 'translate(-50%, -60px) scale(0.8)', opacity: 0 }
        ], {
            duration: 800,
            easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
        }).onfinish = () => popup.remove();
    }
    
    // Add bounce animation to button
    addButtonBounce(button) {
        if (!button) return;
        button.classList.add('button-bounce');
        setTimeout(() => {
            button.classList.remove('button-bounce');
        }, 400);
    }

    updateHouseGuests(guests, gameState = null) {
        const previousCount = this.elements.houseGuests.children.length;
        const previousGuestIds = Array.from(this.elements.houseGuests.children).map(card => 
            card.dataset.guestId + '_' + (card.dataset.instanceId || '')
        );
        
        this.elements.houseGuests.innerHTML = '';
        this.elements.currentGuestsCount.textContent = guests.length;
        
        // Animate count change if it changed
        if (previousCount !== guests.length) {
            this.elements.currentGuestsCount.classList.add('wobble-text');
            setTimeout(() => {
                this.elements.currentGuestsCount.classList.remove('wobble-text');
            }, 400);
        }
        
        guests.forEach((guest) => {
            const card = this.createGuestCard(guest, false, gameState);
            const guestKey = guest.id + '_' + (guest.instanceId || '');
            
            // Only bounce if this is a new guest (not in previous list)
            if (!previousGuestIds.includes(guestKey)) {
                card.classList.add('card-bounce-in');
            }
            
            this.elements.houseGuests.appendChild(card);
        });
    }

    updateGuestList(guests, gameState = null) {
        this.elements.guestList.innerHTML = '';
        
        // If gameState is provided, show available guest counts (excluding those in house)
        if (gameState) {
            const availableCounts = gameState.getAvailableGuestCounts();
            
            // Show available guests with counts
            Object.values(availableCounts).forEach(({ name, count }) => {
                // Get first guest of this type from available guests
                const availableGuests = gameState.getAvailableGuests();
                const guest = availableGuests.find(g => g.name === name);
                
                if (guest) {
                    const card = this.createGuestCard(guest, false);
                    const countBadge = document.createElement('span');
                    countBadge.textContent = ` x${count} (Available)`;
                    countBadge.style.fontWeight = 'bold';
                    countBadge.style.color = '#667eea';
                    card.querySelector('.guest-name').appendChild(countBadge);
                    this.elements.guestList.appendChild(card);
                }
            });
            
            // Show message if no guests available
            if (Object.keys(availableCounts).length === 0) {
                const emptyMsg = document.createElement('div');
                emptyMsg.textContent = 'No guests available in pool';
                emptyMsg.style.textAlign = 'center';
                emptyMsg.style.color = '#999';
                emptyMsg.style.padding = '20px';
                this.elements.guestList.appendChild(emptyMsg);
            }
        } else {
            // Fallback to original behavior if no gameState provided
            const grouped = {};
            guests.forEach(guest => {
                if (!grouped[guest.name]) {
                    grouped[guest.name] = { guest, count: 0 };
                }
                grouped[guest.name].count++;
            });
            
            Object.values(grouped).forEach(({ guest, count }) => {
                const card = this.createGuestCard(guest, false);
                const countBadge = document.createElement('span');
                countBadge.textContent = ` x${count}`;
                countBadge.style.fontWeight = 'bold';
                countBadge.style.color = '#667eea';
                card.querySelector('.guest-name').appendChild(countBadge);
                this.elements.guestList.appendChild(card);
            });
        }
    }

    updateTroubleWarning(troubleCount) {
        const previousCount = parseInt(this.elements.troubleCount.textContent) || 0;
        this.elements.troubleCount.textContent = troubleCount;
        const warning = this.elements.troubleCount.closest('.trouble-warning');
        
        // Animate trouble count change
        if (troubleCount !== previousCount) {
            this.elements.troubleCount.classList.add('wobble-text');
            setTimeout(() => {
                this.elements.troubleCount.classList.remove('wobble-text');
            }, 400);
        }
        
        // Shake the warning bar when 2+ troubles (not screen shake)
        if (troubleCount >= 2) {
            warning.classList.add('shake-warning');
        } else {
            warning.classList.remove('shake-warning');
        }
        
        if (troubleCount >= 3) {
            warning.classList.add('danger');
        } else {
            warning.classList.remove('danger');
            if (troubleCount >= 2) {
                warning.style.borderColor = '#ff6b6b';
            } else {
                warning.style.borderColor = '#dc3545';
            }
        }
    }

    updateShop(shopGuests, gameState) {
        // Always update shop to refresh button states (popularity/cash may have changed)
        this.elements.shopGuests.innerHTML = '';
        
        shopGuests.forEach((guestKey) => {
            const shopItem = this.createShopItem(guestKey, gameState);
            if (shopItem) {
                this.elements.shopGuests.appendChild(shopItem);
            }
        });
        
        // Update capacity upgrade cost
        this.elements.capacityCost.textContent = gameState.getCapacityUpgradeCost();
        const canUpgrade = gameState.cash >= gameState.getCapacityUpgradeCost() && gameState.houseCapacity < 35;
        const wasDisabled = this.elements.upgradeCapacityBtn.disabled;
        this.elements.upgradeCapacityBtn.disabled = !canUpgrade;
        
        // Add shake if button becomes disabled
        if (!canUpgrade && !wasDisabled) {
            this.elements.upgradeCapacityBtn.classList.add('shake-once');
            setTimeout(() => {
                this.elements.upgradeCapacityBtn.classList.remove('shake-once');
            }, 500);
        }
    }

    createGuestCard(guest, clickable = false, gameState = null) {
        const card = document.createElement('div');
        card.className = 'guest-card';
        card.dataset.guestId = guest.id;
        if (guest.instanceId) {
            card.dataset.instanceId = guest.instanceId;
        }
        
        if (guest.trouble > 0) {
            card.classList.add('trouble');
        }
        if (guest.star > 0) {
            card.classList.add('star');
        }
        
        const name = document.createElement('div');
        name.className = 'guest-name';
        name.textContent = guest.name;
        
        const stats = document.createElement('div');
        stats.className = 'guest-stats';
        
        if (guest.popularity > 0) {
            const pop = document.createElement('div');
            pop.className = 'guest-stat';
            pop.textContent = `⭐ ${guest.popularity} Pop`;
            stats.appendChild(pop);
        }
        
        if (guest.cash !== 0) {
            const cash = document.createElement('div');
            cash.className = 'guest-stat';
            cash.textContent = `💰 ${guest.cash} Cash`;
            if (guest.cash < 0) {
                cash.style.color = '#dc3545';
            }
            stats.appendChild(cash);
        }
        
        if (guest.trouble > 0) {
            const trouble = document.createElement('div');
            trouble.className = 'guest-stat';
            trouble.textContent = `⚠️ ${guest.trouble} Trouble`;
            stats.appendChild(trouble);
        }
        
        if (guest.star > 0) {
            const star = document.createElement('div');
            star.className = 'guest-stat';
            star.textContent = `✨ ${guest.star} Star`;
            stats.appendChild(star);
        }
        
        // Show White Flag indicator for Dog
        if (guest.id === 'dog') {
            const whiteFlag = document.createElement('div');
            whiteFlag.className = 'guest-stat';
            whiteFlag.style.color = '#28a745';
            whiteFlag.textContent = '🕊️ White Flag (Cancels 1 Trouble)';
            stats.appendChild(whiteFlag);
        }
        
        card.appendChild(name);
        card.appendChild(stats);
        
        // Add ability buttons for manual abilities (only in party phase, only in house)
        if (gameState && gameState.isPartyPhase && guest.abilities) {
            const abilitiesContainer = document.createElement('div');
            abilitiesContainer.className = 'guest-abilities';
            abilitiesContainer.style.marginTop = '10px';
            abilitiesContainer.style.display = 'flex';
            abilitiesContainer.style.gap = '5px';
            abilitiesContainer.style.flexWrap = 'wrap';
            
            guest.abilities.forEach(ability => {
                if (ability.type === 'manualReshuffle') {
                    // Grillmaster - Reshuffle button
                    // Check if any guest of this type has used the ability
                    const hasUsed = gameState.hasUsedAbility(guest.id, 'manualReshuffle');
                    if (!hasUsed) {
                        const reshuffleBtn = document.createElement('button');
                        reshuffleBtn.className = 'ability-btn';
                        reshuffleBtn.textContent = 'Reshuffle';
                        reshuffleBtn.style.fontSize = '0.8em';
                        reshuffleBtn.style.padding = '5px 10px';
                        reshuffleBtn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            this.addButtonBounce(reshuffleBtn);
                            if (this.onUseReshuffle) {
                                this.onUseReshuffle(guest.id);
                            }
                        });
                        abilitiesContainer.appendChild(reshuffleBtn);
                    }
                } else if (ability.type === 'kick') {
                    // Bouncer - Kick button
                    // Ensure guest has instanceId (should be set when added to house)
                    if (!guest.instanceId) {
                        // Fallback: create instanceId if missing (shouldn't happen, but safety check)
                        guest.instanceId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                    }
                    
                    // Check if this specific instance has used the ability
                    const hasUsed = gameState.hasInstanceUsedAbility(guest.instanceId, 'kick');
                    
                    const kickBtn = document.createElement('button');
                    kickBtn.className = 'ability-btn';
                    kickBtn.textContent = 'Kick';
                    kickBtn.style.fontSize = '0.8em';
                    kickBtn.style.padding = '5px 10px';
                    
                    // Disable button if already used
                    if (hasUsed) {
                        kickBtn.disabled = true;
                        kickBtn.style.opacity = '0.5';
                        kickBtn.style.cursor = 'not-allowed';
                    } else {
                        kickBtn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            this.addButtonBounce(kickBtn);
                            if (this.onUseKick) {
                                this.onUseKick(guest.instanceId);
                            }
                        });
                    }
                    abilitiesContainer.appendChild(kickBtn);
                } else if (ability.type === 'manualInvite') {
                    // Driver - Invite button
                    // Ensure guest has instanceId (should be set when added to house)
                    if (!guest.instanceId) {
                        // Fallback: create instanceId if missing (shouldn't happen, but safety check)
                        guest.instanceId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                    }
                    
                    // Check if this specific instance has used the ability
                    const hasUsed = gameState.hasInstanceUsedAbility(guest.instanceId, 'manualInvite');
                    
                    const inviteBtn = document.createElement('button');
                    inviteBtn.className = 'ability-btn';
                    inviteBtn.textContent = 'Invite';
                    inviteBtn.style.fontSize = '0.8em';
                    inviteBtn.style.padding = '5px 10px';
                    
                    // Disable button if already used
                    if (hasUsed) {
                        inviteBtn.disabled = true;
                        inviteBtn.style.opacity = '0.5';
                        inviteBtn.style.cursor = 'not-allowed';
                    } else {
                        inviteBtn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            this.addButtonBounce(inviteBtn);
                            if (this.onUseInvite) {
                                this.onUseInvite(guest.instanceId);
                            }
                        });
                    }
                    abilitiesContainer.appendChild(inviteBtn);
                } else if (ability.type === 'peek') {
                    // Watchdog - Peek button
                    // Ensure guest has instanceId (should be set when added to house)
                    if (!guest.instanceId) {
                        // Fallback: create instanceId if missing (shouldn't happen, but safety check)
                        guest.instanceId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                    }
                    
                    // Check if this specific instance has used the ability
                    const hasUsed = gameState.hasInstanceUsedAbility(guest.instanceId, 'peek');
                    
                    const peekBtn = document.createElement('button');
                    peekBtn.className = 'ability-btn';
                    peekBtn.textContent = 'Peek';
                    peekBtn.style.fontSize = '0.8em';
                    peekBtn.style.padding = '5px 10px';
                    
                    // Disable button if already used
                    if (hasUsed) {
                        peekBtn.disabled = true;
                        peekBtn.style.opacity = '0.5';
                        peekBtn.style.cursor = 'not-allowed';
                    } else {
                        peekBtn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            this.addButtonBounce(peekBtn);
                            if (this.onUsePeek) {
                                this.onUsePeek(guest.instanceId);
                            }
                        });
                    }
                    
                    abilitiesContainer.appendChild(peekBtn);
                }
            });
            
            if (abilitiesContainer.children.length > 0) {
                card.appendChild(abilitiesContainer);
            }
        }
        
        return card;
    }

    createShopItem(guestKey, gameState) {
        const guestDef = GuestDefinitions[guestKey];
        if (!guestDef) return null;
        
        const item = document.createElement('div');
        item.className = 'shop-item';
        item.dataset.guestKey = guestKey;
        
        const name = document.createElement('div');
        name.className = 'shop-item-name';
        name.textContent = guestDef.name;
        
        const stats = document.createElement('div');
        stats.className = 'shop-item-stats';
        
        // Build stats HTML
        const cashValue = guestDef.cash || 0;
        let statsHTML = `
            <div>⭐ ${guestDef.popularity || 0} Pop</div>
            <div${cashValue < 0 ? ' style="color: #dc3545;"' : ''}>💰 ${cashValue} Cash</div>
            ${guestDef.trouble > 0 ? `<div>⚠️ ${guestDef.trouble} Trouble</div>` : ''}
            ${guestDef.star > 0 ? `<div>✨ ${guestDef.star} Star</div>` : ''}
        `;
        
        // Add unique abilities display
        if (guestDef.abilities && guestDef.abilities.length > 0) {
            guestDef.abilities.forEach(ability => {
                if (ability.type === 'whiteFlag') {
                    statsHTML += `<div style="color: #28a745;">🕊️ White Flag (Cancels 1 Trouble)</div>`;
                } else if (ability.type === 'manualReshuffle') {
                    statsHTML += `<div style="color: #667eea;">🔄 Reshuffle (Reset party list)</div>`;
                } else if (ability.type === 'kick') {
                    statsHTML += `<div style="color: #dc3545;">👢 Kick (Remove a guest)</div>`;
                } else if (ability.type === 'manualInvite') {
                    statsHTML += `<div style="color: #ffc107;">🚗 Invite (Select guest from pool)</div>`;
                } else if (ability.type === 'peek') {
                    statsHTML += `<div style="color: #17a2b8;">👁️ Peek (View next guest)</div>`;
                } else if (ability.type === 'dancerSynergy') {
                    statsHTML += `<div style="color: #e91e63;">💃 Pop: +Number of Dancers²</div>`;
                } else if (ability.type === 'comedianSynergy') {
                    statsHTML += `<div style="color: #e91e63;">😂 +5 Pop if house is full</div>`;
                }
            });
        }
        
        stats.innerHTML = statsHTML;
        
        const cost = document.createElement('div');
        cost.style.marginTop = '10px';
        cost.style.fontWeight = 'bold';
        cost.textContent = `Cost: ${guestDef.cost} Popularity`;
        
        // Show purchase count and limit
        const purchaseInfo = document.createElement('div');
        purchaseInfo.style.marginTop = '5px';
        purchaseInfo.style.fontSize = '0.9em';
        purchaseInfo.style.color = '#666';
        const purchaseCount = gameState.getGuestPurchaseCount(guestKey);
        const isStarGuest = guestDef.star > 0;
        if (isStarGuest) {
            purchaseInfo.textContent = `Owned: ${purchaseCount} (Unlimited)`;
        } else {
            purchaseInfo.textContent = `Owned: ${purchaseCount} / 4`;
        }
        
        const buyBtn = document.createElement('button');
        buyBtn.className = 'shop-btn';
        buyBtn.textContent = 'Buy';
        const canPurchase = gameState.canPurchaseGuest(guestKey);
        buyBtn.disabled = gameState.popularity < guestDef.cost || !canPurchase;
        
        // Add click handler - only works if button is enabled
        buyBtn.addEventListener('click', (e) => {
            // Prevent action if button is disabled
            if (buyBtn.disabled) {
                e.preventDefault();
                e.stopPropagation();
                return;
            }
            
            if (this.onBuyGuest) {
                this.addButtonBounce(buyBtn);
                // Add scale bounce to shop item
                item.classList.add('scale-bounce');
                setTimeout(() => {
                    item.classList.remove('scale-bounce');
                }, 500);
                this.onBuyGuest(guestKey);
            }
        });
        
        item.appendChild(name);
        item.appendChild(stats);
        item.appendChild(cost);
        item.appendChild(purchaseInfo);
        item.appendChild(buyBtn);
        
        return item;
    }

    updateDoorButton(enabled) {
        const wasDisabled = this.elements.doorButton.disabled;
        this.elements.doorButton.disabled = !enabled;
        
        // Add shake animation if button becomes disabled
        if (!enabled && !wasDisabled) {
            this.elements.doorButton.classList.add('shake-once');
            setTimeout(() => {
                this.elements.doorButton.classList.remove('shake-once');
            }, 500);
        }
    }
    
    updateDoorButtonText(text) {
        if (this.elements.doorButton) {
            this.elements.doorButton.textContent = text;
        }
    }

}

