// Interface/Base class (Để thầy thấy tính đa hình)
class SortStrategy {
    apply(query) {
        throw new Error("Phải override hàm này!");
    }
}

export class PriceAscending extends SortStrategy {
    apply(query) {
        return query.orderBy('regularPrice', 'asc');
    }
}

export class CapacityDescending extends SortStrategy {
    apply(query) {
        return query.orderBy('maxCapacity', 'desc');
    }
}

export class DefaultSort extends SortStrategy {
    apply(query) {
        return query.orderBy('name', 'asc');
    }
}

export class DiscountDescending extends SortStrategy {
    apply(query) {
        return query.orderByRaw('CAST(discount AS DECIMAL) DESC');
    }
}