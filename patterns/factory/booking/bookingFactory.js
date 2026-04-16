// Factory Method Pattern for Booking Creation
import { BasicPricingStrategy, BreakfastPricingStrategy, DiscountPricingStrategy, CombinedPricingStrategy } from '../../strategy/booking/pricingStrategies.js';

export class BookingFactory {
    static createBooking(type, bookingData) {
        const strategy = this.getPricingStrategy(type, bookingData);
        const finalPrice = strategy.calculatePrice(bookingData.cabinPrice, bookingData);

        return {
            ...bookingData,
            cabinPrice: finalPrice,
            type: type,
            status: 'confirmed'
        };
    }

    static getPricingStrategy(type, bookingData) {
        switch (type) {
            case 'basic':
                return new BasicPricingStrategy();
            case 'breakfast':
                return new BreakfastPricingStrategy();
            case 'discount':
                return new DiscountPricingStrategy();
            case 'premium':
                const combined = new CombinedPricingStrategy();
                combined.addStrategy(new BreakfastPricingStrategy());
                combined.addStrategy(new DiscountPricingStrategy());
                return combined;
            default:
                return new BasicPricingStrategy();
        }
    }
}