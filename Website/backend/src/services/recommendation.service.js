
class RecommendationService {
    constructor() {
        // Simple static rules
        this.rules = [
            { trigger: 'milk', suggestion: 'Cookies', type: 'cross-sell', discount: '5% off Cookies' },
            { trigger: 'bread', suggestion: 'Butter', type: 'cross-sell', discount: '10% off Butter' },
            { trigger: 'chips', suggestion: 'Cold Drink', type: 'cross-sell', discount: 'Buy 1 Get 1' },
            { trigger: 'coffee', suggestion: 'Sugar', type: 'cross-sell', discount: '5% off' },
            { trigger: 'flour', suggestion: 'Sugar', type: 'cross-sell', discount: 'Best Price' },
            { trigger: 'shampoo', suggestion: 'Conditioner', type: 'upsell', discount: 'Combo Deal' }
        ];
    }

    getSuggestions(cartItems) {
        if (!cartItems || !Array.isArray(cartItems)) return null;

        // Convert cart items to lowercase for matching
        const normalizedCart = cartItems.map(item => item.toLowerCase());

        // Find first matching rule
        for (const rule of this.rules) {
            // Check if any cart item contains the trigger word
            const match = normalizedCart.find(item => item.includes(rule.trigger));

            if (match) {
                return {
                    type: 'ad',
                    headline: `Try ${rule.suggestion}!`,
                    body: `Since you bought ${match}, why not add ${rule.suggestion}?`,
                    discount_code: rule.discount,
                    suggestion: rule.suggestion
                };
            }
        }

        // Default suggestion if no rules match
        return {
            type: 'ad',
            headline: 'Special Offer',
            body: 'Check out our daily fresh vegetables section!',
            discount_code: 'VEG10',
            suggestion: 'Vegetables'
        };
    }
}

export default new RecommendationService();
