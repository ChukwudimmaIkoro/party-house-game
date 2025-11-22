/**
 * Guest System - Modular guest definitions and ability framework
 */

export class Guest {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.popularity = data.popularity || 0;
        this.cash = data.cash || 0;
        this.trouble = data.trouble || 0;
        this.star = data.star || 0;
        this.type = data.type || 'basic';
        this.abilities = data.abilities || [];
        this.cost = data.cost || 0; // Cost in popularity to buy
        this.description = data.description || '';
    }

    /**
     * Execute guest abilities when they join the party
     * @param {GameState} gameState - Current game state
     * @param {Array<Guest>} houseGuests - Current guests in house
     * @returns {Object} - Effects to apply (e.g., { invite: [guest], reshuffle: true })
     */
    executeAbilities(gameState, houseGuests) {
        const effects = {
            invite: [],
            reshuffle: false,
            modify: []
        };

        for (const ability of this.abilities) {
            switch (ability.type) {
                case 'invite':
                    // Auto-invite another guest
                    const invitedGuest = this.inviteGuest(gameState, ability);
                    if (invitedGuest) {
                        effects.invite.push(invitedGuest);
                    }
                    break;
                
                case 'synergy':
                    // Synergy with other guests
                    this.applySynergy(houseGuests, ability, effects);
                    break;
                
                case 'reshuffle':
                    // Reshuffle current configuration
                    effects.reshuffle = true;
                    break;
                
                case 'modify':
                    // Modify other guests or game state
                    this.applyModification(houseGuests, ability, effects);
                    break;
            }
        }

        return effects;
    }

    inviteGuest(gameState, ability) {
        // Find a guest from the guest list that matches the criteria
        const availableGuests = gameState.guestList.filter(g => 
            !gameState.houseGuests.some(hg => hg.id === g.id)
        );
        
        if (availableGuests.length === 0) return null;

        // Filter by type if specified
        let candidates = availableGuests;
        if (ability.guestType) {
            candidates = availableGuests.filter(g => g.type === ability.guestType);
        }

        if (candidates.length === 0) return null;

        // Return random guest from candidates
        return candidates[Math.floor(Math.random() * candidates.length)];
    }

    applySynergy(houseGuests, ability, effects) {
        // Find guests that match synergy criteria
        const matchingGuests = houseGuests.filter(g => {
            if (ability.withType) {
                return g.type === ability.withType;
            }
            if (ability.withName) {
                return g.name === ability.withName;
            }
            return false;
        });

        if (matchingGuests.length > 0) {
            // Apply synergy bonus
            if (ability.bonus) {
                effects.modify.push({
                    target: 'self',
                    property: ability.bonus.property,
                    value: ability.bonus.value
                });
            }
        }
    }

    applyModification(houseGuests, ability, effects) {
        // Apply modifications to guests or game state
        if (ability.target === 'others') {
            houseGuests.forEach(guest => {
                if (guest.id !== this.id) {
                    effects.modify.push({
                        target: guest.id,
                        property: ability.property,
                        value: ability.value
                    });
                }
            });
        }
    }

    /**
     * Get display information for the guest
     */
    getDisplayInfo() {
        return {
            name: this.name,
            popularity: this.popularity,
            cash: this.cash,
            trouble: this.trouble,
            star: this.star,
            type: this.type,
            description: this.description
        };
    }
}

/**
 * Guest Definitions - Predefined guest types
 */
export const GuestDefinitions = {
    // Basic Guests
    basic: {
        id: 'basic',
        name: 'Party Guest',
        popularity: 1,
        cash: 1,
        trouble: 0,
        star: 0,
        type: 'basic',
        cost: 2,
        description: 'A basic party guest'
    },

    // Star Guests
    star: {
        id: 'star',
        name: 'Star Guest',
        popularity: 2,
        cash: 2,
        trouble: 0,
        star: 1,
        type: 'star',
        cost: 5,
        description: 'A celebrity guest!'
    },

    // Trouble Guests
    troublemaker: {
        id: 'troublemaker',
        name: 'Troublemaker',
        popularity: 3,
        cash: 3,
        trouble: 1,
        star: 0,
        type: 'trouble',
        cost: 3,
        description: 'Causes trouble at parties'
    },

    // Synergy Guests
    musician: {
        id: 'musician',
        name: 'Musician',
        popularity: 2,
        cash: 1,
        trouble: 0,
        star: 0,
        type: 'musician',
        cost: 4,
        description: 'Plays great music',
        abilities: [{
            type: 'synergy',
            withType: 'dancer',
            bonus: { property: 'popularity', value: 1 }
        }]
    },

    dancer: {
        id: 'dancer',
        name: 'Dancer',
        popularity: 1,
        cash: 2,
        trouble: 0,
        star: 0,
        type: 'dancer',
        cost: 4,
        description: 'Loves to dance',
        abilities: [{
            type: 'synergy',
            withType: 'musician',
            bonus: { property: 'cash', value: 1 }
        }]
    },

    // Auto-invite Guests
    socialite: {
        id: 'socialite',
        name: 'Socialite',
        popularity: 1,
        cash: 1,
        trouble: 0,
        star: 0,
        type: 'socialite',
        cost: 6,
        description: 'Invites friends automatically',
        abilities: [{
            type: 'invite',
            guestType: 'basic'
        }]
    },

    // Reshuffle Guest
    partyPlanner: {
        id: 'partyPlanner',
        name: 'Party Planner',
        popularity: 2,
        cash: 2,
        trouble: 0,
        star: 0,
        type: 'planner',
        cost: 7,
        description: 'Reshuffles the party',
        abilities: [{
            type: 'reshuffle'
        }]
    },

    // High Value Guests
    celebrity: {
        id: 'celebrity',
        name: 'Celebrity',
        popularity: 4,
        cash: 4,
        trouble: 0,
        star: 1,
        type: 'celebrity',
        cost: 10,
        description: 'A famous celebrity!'
    },

    // Cash Generator
    investor: {
        id: 'investor',
        name: 'Investor',
        popularity: 1,
        cash: 5,
        trouble: 0,
        star: 0,
        type: 'investor',
        cost: 8,
        description: 'Brings lots of cash'
    },

    // Popularity Generator
    influencer: {
        id: 'influencer',
        name: 'Influencer',
        popularity: 5,
        cash: 1,
        trouble: 0,
        star: 0,
        type: 'influencer',
        cost: 9,
        description: 'Very popular on social media'
    },

    // New Guest Types
    dog: {
        id: 'dog',
        name: 'Dog',
        popularity: 2,
        cash: 0,
        trouble: 0,
        star: 0,
        type: 'dog',
        cost: 4,
        description: 'White Flag: Cancels out one Trouble',
        abilities: [{
            type: 'whiteFlag'
        }]
    },

    grillmaster: {
        id: 'grillmaster',
        name: 'Grillmaster',
        popularity: 1,
        cash: 1,
        trouble: 0,
        star: 0,
        type: 'grillmaster',
        cost: 5,
        description: 'Reshuffle: Reset party list (once per party)',
        abilities: [{
            type: 'manualReshuffle'
        }]
    },

    bouncer: {
        id: 'bouncer',
        name: 'Bouncer',
        popularity: 0,
        cash: 0,
        trouble: 0,
        star: 0,
        type: 'bouncer',
        cost: 3,
        description: 'Kick: Remove a guest from the party',
        abilities: [{
            type: 'kick'
        }]
    },

    driver: {
        id: 'driver',
        name: 'Driver',
        popularity: 0,
        cash: 0,
        trouble: 0,
        star: 0,
        type: 'driver',
        cost: 3,
        description: 'Invite: Select a guest from pool to invite',
        abilities: [{
            type: 'manualInvite'
        }]
    }
};

/**
 * Create a guest instance from a definition
 */
export function createGuest(definitionKey) {
    const definition = GuestDefinitions[definitionKey];
    if (!definition) {
        throw new Error(`Guest definition not found: ${definitionKey}`);
    }
    return new Guest(definition);
}

/**
 * Get random guest from available pool
 */
export function getRandomGuest(availableGuests) {
    if (availableGuests.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * availableGuests.length);
    return availableGuests[randomIndex];
}

