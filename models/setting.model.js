import db from '../dbHelper/db.js';

const DEFAULT_SETTINGS = {
    miniBookingLength: 1,
    maxBookingLength: 30,
    maxNumberOfGuests: 10,
    breakfastPrice: 15
};

export default {
    async getCurrent() {
        const current = await db('settings').orderBy('_id', 'asc').first();

        if (!current) {
            const inserted = await db('settings')
                .insert(DEFAULT_SETTINGS)
                .returning('*');
            return inserted?.[0] || DEFAULT_SETTINGS;
        }

        return current;
    },

    async updateCurrent(payload) {
        const current = await this.getCurrent();

        const updateData = {
            miniBookingLength: Number(payload.miniBookingLength) || current.miniBookingLength,
            maxBookingLength: Number(payload.maxBookingLength) || current.maxBookingLength,
            maxNumberOfGuests: Number(payload.maxNumberOfGuests) || current.maxNumberOfGuests,
            breakfastPrice: Number(payload.breakfastPrice) || current.breakfastPrice
        };

        const updated = await db('settings')
            .where('_id', current._id)
            .update(updateData)
            .returning('*');

        return updated?.[0] || { ...current, ...updateData };
    }
};
