import { PriceAscending, CapacityDescending, DefaultSort } from '../../strategy/cabin/sortStrategies.js';

export class CabinSortFactory {
    static getStrategy(type) {
        switch (type) {
            case 'price-asc':
                return new PriceAscending();
            case 'capacity-desc':
                return new CapacityDescending();
            default:
                return new DefaultSort();
        }
    }
}