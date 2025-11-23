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
                
                case 'dancerSynergy':
                    // Special exponential dancer synergy
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
        // Special case for dancer synergy (exponential scaling)
        if (ability.type === 'dancerSynergy') {
            // Mark this as dancer synergy for special handling
            effects.modify.push({
                isDancerSynergy: true
            });
            return;
        }
        
        // Standard synergy logic
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

}

/**
 * Guest Definitions - Predefined guest types
 */
export const GuestDefinitions = {
    // Basic Guests
    basic: {
        id: 'basic',
        name: 'Old Friend',
        popularity: 1,
        cash: 0,
        trouble: 0,
        star: 0,
        type: 'basic',
        cost: 2,
        description: 'A basic party guest'
    },

    // Basic Guests
    rich: {
        id: 'rich',
        name: 'Rich Friend',
        popularity: 0,
        cash: 1,
        trouble: 0,
        star: 0,
        type: 'basic',
        cost: 3,
        description: 'A rich guest'
    },

    // Star Guests
    star: {
        id: 'superstar',
        name: 'Superstar',
        popularity: 3,
        cash: 0,
        trouble: 0,
        star: 1,
        type: 'star',
        cost: 45,
        description: 'A superstar guest!'
    },

    alien: {
        id: 'alien',
        name: 'Alien',
        popularity: 0,
        cash: 0,
        trouble: 0,
        star: 1,
        type: 'star',
        cost: 35,
        description: 'An alien!!!'
    },

    dinosaur: {
        id: 'dinosaur',
        name: 'Dinosaur',
        popularity: 0,
        cash: 0,
        trouble: 1,
        star: 1,
        type: 'star',
        cost: 25,
        description: 'Rawr! A dinosaur!!!'
    },


    // Trouble Guests
    troublemaker: {
        id: 'troublemaker',
        name: 'Troublemaker',
        popularity: 2,
        cash: 0,
        trouble: 1,
        star: 0,
        type: 'trouble',
        cost: 3,
        description: 'Causes trouble at parties'
    },

    rockstar: {
        id: 'rockstar',
        name: 'Rockstar',
        popularity: 3,
        cash: 2,
        trouble: 1,
        star: 0,
        type: 'trouble',
        cost: 5,
        description: 'Rock on!'
    },

    monkey: {
        id: 'monkey',
        name: 'Monkey',
        popularity: 4,
        cash: 0,
        trouble: 1,
        star: 0,
        type: 'trouble',
        cost: 5,
        description: 'Some real monkey business!'
    },

    // Synergy Guests
    dancer: {
        id: 'dancer',
        name: 'Dancer',
        popularity: 1,
        cash: 0,
        trouble: 0,
        star: 0,
        type: 'dancer',
        cost: 4,
        description: 'Loves to dance - Value increases exponentially with more dancers!',
        abilities: [{
            type: 'dancerSynergy'
        }]
    },

    comedian: {
        id: 'comedian',
        name: 'Comedian',
        popularity: 0,
        cash: -1,
        trouble: 0,
        star: 0,
        type: 'comedian',
        cost: 4,
        description: 'If house is full at end of round, becomes 5 Pop',
        abilities: [{
            type: 'comedianSynergy'
        }]
    },

    // Auto-invite Guests
    socialite: {
        id: 'celebrity',
        name: 'Celebrity',
        popularity: 1,
        cash: 2,
        trouble: 0,
        star: 0,
        type: 'celebrity',
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

    auctioneer: {
        id: 'auctioneer',
        name: 'Auctioneer',
        popularity: 0,
        cash: 3,
        trouble: 0,
        star: 0,
        type: 'auctioneer',
        cost: 9,
        description: 'Brings lots of cash'
    },

    influencer: {
        id: 'influencer',
        name: 'Influencer',
        popularity: 3,
        cash: 1,
        trouble: 0,
        star: 0,
        type: 'influencer',
        cost: 6,
        description: 'Very popular on social media'
    },

    // Trouble Mitigation Guests
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

    // Ability Guests
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
        cost: 4,
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
    },

    watchdog: {
        id: 'watchdog',
        name: 'Watchdog',
        popularity: 2,
        cash: 0,
        trouble: 0,
        star: 0,
        type: 'watchdog',
        cost: 6,
        description: 'Peek: View what the next guest will be',
        abilities: [{
            type: 'peek'
        }]
    },

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

