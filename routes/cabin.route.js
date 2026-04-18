import express from 'express';
import cabinModel from '../models/cabin.model.js';
import rateModel from '../models/rate.model.js';
// Import Factory từ đúng folder mới
import { CabinSortFactory } from '../patterns/factory/cabin/factoryPattern.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const sortType = req.query.sort || 'default';
        
        // Lấy query gốc từ model
        let query = cabinModel.findAllQuery();

        // Bước 1: Gọi Factory để lấy Strategy (Kiến trúc Factory Method)
        const strategy = CabinSortFactory.getStrategy(sortType);
        
        // Bước 2: Áp dụng Strategy vào query (Kiến trúc Strategy Pattern)
        query = strategy.apply(query);

        // Bước 3: Thực thi query lấy dữ liệu từ Supabase
        const list = await query;

        res.render('vwCabins/index', {
            cabins: list,
            empty: list.length === 0,
            activeSort: sortType
        });
    } catch (error) {
        console.error("Lỗi Pattern:", error);
        res.status(500).send("Internal Server Error");
    }
});

router.get('/detail/:id', async (req, res) => {
    const id = req.params.id;
    const cabin = await cabinModel.findById(id);
    if (!cabin) return res.redirect('/cabins');

    const rates = await rateModel.findByCabinId(id);
    const totalRating = rates.reduce((sum, item) => sum + Number(item.rating || 0), 0);
    const avgRating = rates.length ? (totalRating / rates.length).toFixed(1) : null;

    res.render('vwCabins/detail', {
        cabin: cabin,
        rates,
        avgRating,
        hasRates: rates.length > 0
    });
});

export default router;