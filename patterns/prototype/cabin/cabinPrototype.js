export class CabinPrototype {
    constructor(cabin) {
        this.cabin = cabin;
    }

    clone(overrides = {}) {
        const {
            _id,
            id,
            created_at,
            updated_at,
            createdAt,
            updatedAt,
            ...cloneData
        } = this.cabin;

        return {
            ...cloneData,
            ...overrides
        };
    }
}
