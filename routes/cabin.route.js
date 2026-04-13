import express from 'express';
import cabinModel from '../models/cabin.model.js';
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
    res.render('vwCabins/detail', { cabin: cabin });
});

export default router;