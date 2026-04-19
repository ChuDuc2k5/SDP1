import { PriceAscending, CapacityDescending, DefaultSort, DiscountDescending } from '../../strategy/cabin/sortStrategies.js';

export class CabinSortFactory {
    static getStrategy(type) {
        switch (type) {
            case 'price-asc':
                return new PriceAscending();
            case 'capacity-desc':
                return new CapacityDescending();
            case 'discount-desc':
                return new DiscountDescending();
            default:
                return new DefaultSort();
        }
    }
}