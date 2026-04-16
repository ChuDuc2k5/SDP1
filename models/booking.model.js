import db from  '../dbHelper/db.js';

const attachCabin = (rows) => rows.map(row => ({
    ...row,
    cabin: {
        _id: row.cabinId,
        name: row.cabinName,
        image: row.cabinImage,
        maxCapacity: row.cabinMaxCapacity,
        regularPrice: row.cabinRegularPrice,
        discount: row.cabinDiscount
    }
}));

export default {
    findAll() {
        return db('bookings as b')
            .join('cabins as c', 'b.cabinId', 'c._id')
            .select(
                'b.*',
                'c.name as cabinName',
                'c.image as cabinImage',
                'c.maxCapacity as cabinMaxCapacity',
                'c.regularPrice as cabinRegularPrice',
                'c.discount as cabinDiscount'
            )
            .orderBy('b.startDate', 'desc')
            .then(attachCabin);
    },
    findByUserId(userId) {
        return db('bookings as b')
            .join('cabins as c', 'b.cabinId', 'c._id')
            .select(
                'b.*',
                'c.name as cabinName',
                'c.image as cabinImage',
                'c.maxCapacity as cabinMaxCapacity',
                'c.regularPrice as cabinRegularPrice',
                'c.discount as cabinDiscount'
            )
            .where('b.userId', userId)
            .orderBy('b.startDate', 'desc')
            .then(attachCabin);
    },
    findById(id) {
        return db('bookings as b')
            .join('cabins as c', 'b.cabinId', 'c._id')
            .select(
                'b.*',
                'c.name as cabinName',
                'c.image as cabinImage',
                'c.maxCapacity as cabinMaxCapacity',
                'c.regularPrice as cabinRegularPrice',
                'c.discount as cabinDiscount'
            )
            .where('b._id', id)
            .first()
            .then(row => row ? {
                ...row,
                cabin: {
                    _id: row.cabinId,
                    name: row.cabinName,
                    image: row.cabinImage,
                    maxCapacity: row.cabinMaxCapacity,
                    regularPrice: row.cabinRegularPrice,
                    discount: row.cabinDiscount
                }
            } : undefined);
    },
    create(booking) {
        return db('bookings').insert(booking).returning('*').then(rows => rows[0]);
    },
    update(id, booking) {
        return db('bookings').where('_id', id).update(booking).returning('*').then(rows => rows[0]);
    }
};  