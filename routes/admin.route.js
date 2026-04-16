import express from 'express';
import multer from 'multer';
import path from 'path';
import cabinModel from '../models/cabin.model.js';

const router = express.Router();

// ==================== MULTER CONFIG ====================
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/images/cabins');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });
// =====================================================

router.get('/', (req, res) => {
    res.redirect('/admin/cabins');
});

// ==================== GET ALL CABINS (ĐÃ SỬA AN TOÀN) ====================
router.get('/cabins', async (req, res) => {
    try {
        let list = await cabinModel.findAll();

        console.log('🔍 Raw data from findAll():', list);   // ← Dùng để debug

        // Bảo vệ tối đa
        if (!list || !Array.isArray(list)) {
            list = [];
        }

        // Loại bỏ các phần tử undefined / null
        list = list.filter(cabin => cabin && typeof cabin === 'object' && cabin !== null);

        console.log(`✅ Loaded ${list.length} valid cabins`);

        res.render('vwAdmin/manage-cabin', {
            layout: 'admin',
            cabins: list
        });
    } catch (err) {
        console.error('❌ Lỗi khi load cabins:', err);
        res.render('vwAdmin/manage-cabin', {
            layout: 'admin',
            cabins: [],
            error: 'Không thể tải danh sách cabin'
        });
    }
});

// ==================== CREATE CABIN ====================
router.get('/cabins/add', (req, res) => {
    res.render('vwAdmin/create-cabin', { layout: 'admin' });
});

router.post('/cabins/add', upload.single('image'), async (req, res) => {
    try {
        const newCabin = {
            name: req.body.name,
            maxCapacity: parseInt(req.body.maxCapacity) || 0,
            regularPrice: parseInt(req.body.regularPrice) || 0,
            discount: parseInt(req.body.discount) || 0,
            description: req.body.description || '',
            image: req.file 
                ? `/images/cabins/${req.file.filename}` 
                : '/images/aboutBackground.jpg'
        };

        await cabinModel.add(newCabin);
        res.redirect('/admin/cabins');
    } catch (err) {
        console.error('❌ Lỗi khi thêm cabin:', err);
        res.redirect('/admin/cabins');
    }
});

// ==================== EDIT CABIN ====================
router.get('/cabins/edit/:id', async (req, res) => {
    const cabin = await cabinModel.findById(req.params.id);
    if (!cabin) return res.redirect('/admin/cabins');

    res.render('vwAdmin/edit-cabin', {
        layout: 'admin',
        cabin: cabin
    });
});

router.post('/cabins/edit/:id', upload.single('image'), async (req, res) => {
    try {
        const updatedData = {
            name: req.body.name,
            maxCapacity: parseInt(req.body.maxCapacity),
            regularPrice: parseInt(req.body.regularPrice),
            discount: parseInt(req.body.discount) || 0,
            description: req.body.description
        };

        // Nếu có upload ảnh mới thì cập nhật
        if (req.file) {
            updatedData.image = `/images/cabins/${req.file.filename}`;
        }

        await cabinModel.update(req.params.id, updatedData);
        res.redirect('/admin/cabins');
    } catch (err) {
        console.error('❌ Lỗi khi cập nhật cabin:', err);
        res.redirect('/admin/cabins');
    }
});

// ==================== DELETE & CLONE ====================
router.post('/cabins/delete/:id', async (req, res) => {
    await cabinModel.delete(req.params.id);
    res.redirect('/admin/cabins');
});

router.post('/cabins/clone/:id', async (req, res) => {
    const cabinId = req.params.id;
    res.send(`Đã kích hoạt Prototype Pattern để sao chép cabin ID: ${cabinId}`);
});

// ==================== SETTINGS & ORDERS ====================
router.get('/settings', (req, res) => { 
    res.render('vwAdmin/settings', { layout: 'admin' }); 
});

router.get('/orders', (req, res) => { 
    res.render('vwAdmin/manage-orders', { layout: 'admin' }); 
});
router.post('/settings', async (req, res) => {
    try {
        const settings = {
            breakfastPrice: parseInt(req.body.breakfastPrice) || 0,
            minBookingLength: parseInt(req.body.minBookingLength) || 1,
            maxBookingLength: parseInt(req.body.maxBookingLength) || 30,
            maxGuests: parseInt(req.body.maxGuests) || 1
        };

        console.log('✅ UPDATED:', settings);

        res.render('vwAdmin/settings', {
            layout: 'admin',
            success: true
        });

    } catch (err) {
        res.render('vwAdmin/settings', {
            layout: 'admin',
            error: true
        });
    }
});

export default router;
