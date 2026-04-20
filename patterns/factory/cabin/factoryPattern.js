import { PriceAscending, CapacityDescending, DefaultSort, DiscountDescending, RatingDescending } from '../../strategy/cabin/sortStrategies.js';

export class CabinSortFactory {
    static getStrategy(type) {
        switch (type) {
            case 'price-asc':
                return new PriceAscending();
            case 'capacity-desc':
                return new CapacityDescending();
            case 'discount-desc':
                return new DiscountDescending();
            case 'rating-desc':
                return new RatingDescending();
            default:
                return new DefaultSort();
        }
    }
}