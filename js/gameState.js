/**
 * Game State Management
 */

import { createGuest, GuestDefinitions } from './guest.js';

export class GameState {
    constructor() {
        this.reset();
    }

    reset() {
        // Currencies
        this.popularity = 0;
        this.cash = 0;
        
        // House
        this.houseCapacity = 5;
        this.houseGuests = [];
        this.capacityUpgradeCount = 0; // Track number of upgrades purchased
        
        // Round Management
        this.currentRound = 1;
        this.maxRounds = 25;
        this.isPartyPhase = true;
        
        // Track ability usage per guest per party phase
        this.abilityUsed = {}; // { guestId: { abilityType: true } }
        // Track kicked guests for this phase (they don't go back to pool)
        this.kickedGuests = []; // Array of guest IDs that were kicked this phase
        
        // Guest List (pool of available guests)
        this.guestList = [];
        this.ownedGuests = []; // Guests the player has purchased
        
        // Pre-selected next guest for invitation
        this.nextGuest = null; // The next guest that will be invited when door is clicked
        
        // Shop - persistent pool of 10 unique guests
        this.shopPool = []; // Pool of 10 unique guests available throughout the game
        this.guestPurchaseCounts = {}; // Track how many copies of each guest have been purchased
        
        // Win Condition
        this.starCount = 0;
        
        // Initialize starting guest list
        this.initializeStartingGuests();
        this.initializeShopPool();
    }

    /**
     * Initialize starting guest pool
     */
    initializeStartingGuests() {
        // Start with 7 Party Guests and 3 Troublemaker Guests
        this.ownedGuests = [
            'basic', 'basic', 'basic', 'basic', 'rich', 'rich', 'rich',
            'troublemaker', 'troublemaker', 'troublemaker'
        ];
        this.updateGuestList();
    }

    /**
     * Update the guest list from owned guests
     */
    updateGuestList() {
        this.guestList = this.ownedGuests.map(key => createGuest(key));
    }

    /**
     * Initialize shop pool of 10 unique guests (2 must be star guests)
     * This pool persists throughout the entire game
     * All guest types can appear in the shop
     */
    initializeShopPool() {
        // Get all available guest types from GuestDefinitions
        // Exclude starting guests (basic, troublemaker) since player starts with them
        const allGuestTypes = Object.keys(GuestDefinitions).filter(key => 
            key !== 'basic' && key !== 'troublemaker'
        );
        
        // Separate star guests from non-star guests
        const starGuestTypes = [];
        const nonStarGuestTypes = [];
        
        allGuestTypes.forEach(guestKey => {
            const guestDef = GuestDefinitions[guestKey];
            if (guestDef && guestDef.star > 0) {
                starGuestTypes.push(guestKey);
            } else {
                nonStarGuestTypes.push(guestKey);
            }
        });
        
        // Ensure we have at least 2 star guests available
        if (starGuestTypes.length < 2) {
            console.warn('Warning: Less than 2 star guest types available!');
        }
        
        // Select at least 2 star guests (randomly select from available star guests)
        const shuffledStars = [...starGuestTypes].sort(() => 0.5 - Math.random());
        const selectedStarGuests = shuffledStars.slice(0, Math.min(2, shuffledStars.length));
        
        // If we need more star guests to reach 2, duplicate from available ones
        while (selectedStarGuests.length < 2 && shuffledStars.length > 0) {
            const additionalStar = shuffledStars[Math.floor(Math.random() * shuffledStars.length)];
            if (!selectedStarGuests.includes(additionalStar)) {
                selectedStarGuests.push(additionalStar);
            }
        }
        
        // Calculate how many more guests we need (10 total - selected star guests)
        const remainingCount = 10 - selectedStarGuests.length;
        
        // Select remaining guests from all types (excluding already selected star guests)
        const availableForSelection = [...nonStarGuestTypes, ...starGuestTypes.filter(s => !selectedStarGuests.includes(s))];
        const shuffledRemaining = [...availableForSelection].sort(() => 0.5 - Math.random());
        const selectedRemaining = shuffledRemaining.slice(0, remainingCount);
        
        // Combine to get exactly 10 unique guests (at least 2 star + others)
        this.shopPool = [...selectedStarGuests, ...selectedRemaining];
        
        // Shuffle the final pool for randomness
        this.shopPool = this.shopPool.sort(() => 0.5 - Math.random());
        
        // Initialize purchase counts
        this.shopPool.forEach(guestKey => {
            this.guestPurchaseCounts[guestKey] = 0;
        });
        
        // Set shop guests to the pool (all 10 are available)
        this.shopGuests = [...this.shopPool];
    }

    /**
     * Add guest to house
     */
    addGuestToHouse(guest) {
        if (this.houseGuests.length >= this.houseCapacity) {
            return false; // House is full
        }
        
        // Add unique instance ID to track individual guest instances
        if (!guest.instanceId) {
            guest.instanceId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }
        
        this.houseGuests.push(guest);
        return true;
    }

    /**
     * Check if party should end due to trouble
     * Accounts for White Flag ability (Dog cancels 1 trouble)
     */
    checkTrouble() {
        const troubleCount = this.getTroubleCount();
        return troubleCount >= 3;
    }

    /**
     * Get trouble count (accounting for White Flag ability)
     */
    getTroubleCount() {
        const rawTroubleCount = this.houseGuests.reduce((sum, guest) => sum + guest.trouble, 0);
        // Check for Dog (White Flag ability - cancels 1 trouble)
        const hasDog = this.houseGuests.some(guest => guest.id === 'dog');
        const effectiveTrouble = hasDog ? Math.max(0, rawTroubleCount - 1) : rawTroubleCount;
        return effectiveTrouble;
    }
    
    /**
     * Get raw trouble count (before White Flag)
     */
    getRawTroubleCount() {
        return this.houseGuests.reduce((sum, guest) => sum + guest.trouble, 0);
    }
    
    /**
     * Check if a guest has used a specific ability this party phase
     */
    hasUsedAbility(guestId, abilityType) {
        return this.abilityUsed[guestId] && this.abilityUsed[guestId][abilityType] === true;
    }
    
    /**
     * Check if a specific guest instance has used an ability
     */
    hasInstanceUsedAbility(instanceId, abilityType) {
        return this.abilityUsed[instanceId] && this.abilityUsed[instanceId][abilityType] === true;
    }
    
    /**
     * Mark an ability as used for a guest
     */
    markAbilityUsed(guestId, abilityType) {
        if (!this.abilityUsed[guestId]) {
            this.abilityUsed[guestId] = {};
        }
        this.abilityUsed[guestId][abilityType] = true;
    }
    
    /**
     * Mark an ability as used for a specific guest instance
     */
    markInstanceAbilityUsed(instanceId, abilityType) {
        if (!this.abilityUsed[instanceId]) {
            this.abilityUsed[instanceId] = {};
        }
        this.abilityUsed[instanceId][abilityType] = true;
    }

    /**
     * Get star count
     */
    getStarCount() {
        return this.houseGuests.reduce((sum, guest) => sum + guest.star, 0);
    }

    /**
     * End party phase and collect rewards
     */
    endPartyPhase() {
        // Check if house is full for Comedian ability
        const isHouseFull = this.houseGuests.length >= this.houseCapacity;
        
        // Apply Comedian ability: if house is full, Comedian becomes 5 Pop
        this.houseGuests.forEach(guest => {
            if (guest.id === 'comedian' && isHouseFull) {
                guest.popularity = 5;
            }
        });
        
        // Calculate rewards
        let roundPopularity = 0;
        let roundCash = 0;
        
        // Check star count before clearing
        const currentStarCount = this.getStarCount();
        
        this.houseGuests.forEach(guest => {
            roundPopularity += guest.popularity;
            roundCash += guest.cash;
        });
        
        // Add to totals
        this.popularity += roundPopularity;
        this.cash += roundCash;
        
        // Update star count (for display purposes, tracks current house)
        this.starCount = currentStarCount;
        
        // Clear house
        this.houseGuests = [];
        
        // Move to shop phase
        this.isPartyPhase = false;
        
        return {
            popularity: roundPopularity,
            cash: roundCash,
            starCount: currentStarCount
        };
    }

    /**
     * Start next round
     */
    startNextRound() {
        this.currentRound++;
        this.isPartyPhase = true;
        this.updateGuestList();
        // Shop pool persists, just refresh the display
        this.shopGuests = [...this.shopPool];
        // Reset ability usage and kicked guests for new party phase
        this.abilityUsed = {};
        this.kickedGuests = [];
        // Pre-select the next guest
        this.selectNextGuest();
    }
    
    /**
     * Pre-select the next guest that will be invited
     */
    selectNextGuest() {
        const availableGuests = this.getAvailableGuests();
        if (availableGuests.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableGuests.length);
            this.nextGuest = availableGuests[randomIndex];
        } else {
            this.nextGuest = null; // No more guests available
        }
    }
    
    /**
     * Get the pre-selected next guest
     */
    getNextGuest() {
        return this.nextGuest;
    }
    
    /**
     * Check if there are more guests available to invite
     */
    hasMoreGuests() {
        return this.nextGuest !== null;
    }

    /**
     * Buy a guest from shop
     * Enforces limits: max 4 copies for non-star guests, unlimited for star guests
     */
    buyGuest(guestKey) {
        const guestDef = GuestDefinitions[guestKey];
        if (!guestDef) return false;
        
        // Check if guest is in shop pool
        if (!this.shopPool.includes(guestKey)) return false;
        
        // Check purchase limits
        const isStarGuest = guestDef.star > 0;
        const currentCount = this.guestPurchaseCounts[guestKey] || 0;
        
        if (!isStarGuest && currentCount >= 4) {
            return false; // Max 4 copies for non-star guests
        }
        
        // Check if player has enough popularity
        if (this.popularity >= guestDef.cost) {
            this.popularity -= guestDef.cost;
            this.ownedGuests.push(guestKey);
            this.guestPurchaseCounts[guestKey] = currentCount + 1;
            this.updateGuestList();
            return true;
        }
        return false;
    }
    
    /**
     * Get how many copies of a guest have been purchased
     */
    getGuestPurchaseCount(guestKey) {
        return this.guestPurchaseCounts[guestKey] || 0;
    }
    
    /**
     * Check if a guest can still be purchased (not at limit)
     */
    canPurchaseGuest(guestKey) {
        const guestDef = GuestDefinitions[guestKey];
        if (!guestDef) return false;
        
        const isStarGuest = guestDef.star > 0;
        const currentCount = this.guestPurchaseCounts[guestKey] || 0;
        
        if (isStarGuest) return true; // Unlimited for star guests
        return currentCount < 4; // Max 4 for non-star guests
    }

    /**
     * Upgrade house capacity
     */
    upgradeCapacity() {
        // Check max capacity (35)
        if (this.houseCapacity >= 35) {
            return false;
        }
        
        const cost = this.getCapacityUpgradeCost();
        if (this.cash >= cost) {
            this.cash -= cost;
            this.houseCapacity++;
            this.capacityUpgradeCount++;
            return true;
        }
        return false;
    }

    /**
     * Get cost to upgrade capacity
     * Starts at 2 Cash, increases by 1 each time, caps at 12 Cash
     */
    getCapacityUpgradeCost() {
        // Cost starts at 2, increases by 1 per upgrade, caps at 12
        const cost = 2 + this.capacityUpgradeCount;
        return Math.min(cost, 12);
    }

    /**
     * Check lose condition
     */
    checkLoseCondition() {
        return this.currentRound > this.maxRounds;
    }

    /**
     * Get available guests (not in house, not kicked)
     * Returns guests that can still be invited (accounting for how many of each type are already in house)
     */
    getAvailableGuests() {
        // Count how many of each type are in the house
        const houseCounts = {};
        this.houseGuests.forEach(hg => {
            houseCounts[hg.id] = (houseCounts[hg.id] || 0) + 1;
        });
        
        // Count how many of each type are in the guest list
        const guestListCounts = {};
        this.guestList.forEach(g => {
            guestListCounts[g.id] = (guestListCounts[g.id] || 0) + 1;
        });
        
        // Build available guests list (excluding kicked types entirely)
        const available = [];
        this.guestList.forEach(g => {
            // Skip if this type was kicked
            if (this.kickedGuests.includes(g.id)) {
                return;
            }
            
            // Count how many of this type are already in house
            const inHouse = houseCounts[g.id] || 0;
            // Count how many of this type are in guest list
            const total = guestListCounts[g.id] || 0;
            // Count how many we've already added to available list
            const alreadyAdded = available.filter(a => a.id === g.id).length;
            
            // Add if there are more available than already added
            if (total - inHouse - alreadyAdded > 0) {
                available.push(g);
            }
        });
        
        return available;
    }

    /**
     * Get count of each guest type in the available pool
     */
    getAvailableGuestCounts() {
        const availableGuests = this.getAvailableGuests();
        const counts = {};
        availableGuests.forEach(guest => {
            if (!counts[guest.id]) {
                counts[guest.id] = { name: guest.name, count: 0 };
            }
            counts[guest.id].count++;
        });
        return counts;
    }
}

