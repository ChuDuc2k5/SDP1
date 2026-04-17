import db from '../dbHelper/db.js';
import { CabinPrototype } from '../patterns/prototype/cabin/cabinPrototype.js';

export default {
    // Trả về query builder của Knex để Strategy can thiệp
    findAllQuery() {
        return db('cabins').select('*');
    },

    findAll() {
        return db('cabins').select('*').orderBy('name', 'asc');
    },

    findById(id) {
        return db('cabins').where('_id', id).first();
    },
    add(cabinData) {
        return db('cabins').insert(cabinData);
    },

    async duplicateById(id, overrides = {}) {
        const cabin = await this.findById(id);
        if (!cabin) {
            return null;
        }

        const prototype = new CabinPrototype(cabin);
        const clonedCabin = prototype.clone({
            name: `${cabin.name} (Copy)`,
            ...overrides,
        });

        const inserted = await db('cabins').insert(clonedCabin).returning('*');
        return inserted?.[0] || null;
    },

    update(id, cabinData) {
        return db('cabins').where('_id', id).update(cabinData);
    },

    delete(id) {
        return db('cabins').where('_id', id).del();
    },

};