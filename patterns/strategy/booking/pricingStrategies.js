// Strategy Pattern for Booking Pricing
// Base Strategy Class
class PricingStrategy {
    calculatePrice(basePrice, bookingData) {
        throw new Error('calculatePrice must be implemented');
    }
}

// Concrete Strategies
export class BasicPricingStrategy extends PricingStrategy {
    calculatePrice(basePrice, bookingData) {
        return basePrice;
    }
}

export class BreakfastPricingStrategy extends PricingStrategy {
    calculatePrice(basePrice, bookingData) {
        const breakfastCost = 15; // $15 per night
        const nights = this.calculateNights(bookingData.startDate, bookingData.endDate);
        return basePrice + (breakfastCost * nights);
    }

    calculateNights(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
}

export class DiscountPricingStrategy extends PricingStrategy {
    calculatePrice(basePrice, bookingData) {
        const discountPercent = bookingData.discount || 0;
        return basePrice * (1 - discountPercent / 100);
    }
}

export class CombinedPricingStrategy extends PricingStrategy {
    constructor() {
        super();
        this.strategies = [];
    }

    addStrategy(strategy) {
        this.strategies.push(strategy);
    }

    calculatePrice(basePrice, bookingData) {
        let price = basePrice;
        for (const strategy of this.strategies) {
            price = strategy.calculatePrice(price, bookingData);
        }
        return price;
    }
}