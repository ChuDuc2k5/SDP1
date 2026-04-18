import express from 'express';
import multer from 'multer';
import path from 'path';
import cabinModel from '../models/cabin.model.js';
import settingModel from '../models/setting.model.js';

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

// ==================== GET ALL CABINS (ĐÃ SỬA AN TOÀN) ====================
router.get('/cabins', async (req, res) => {
    try {
        let list = await cabinModel.findAll();



        // Bảo vệ tối đa
        if (!list || !Array.isArray(list)) {
            list = [];
        }

        
        list = list.filter(cabin => cabin && typeof cabin === 'object' && cabin !== null);

        

        res.render('vwAdmin/manage-cabin', {
            cabins: list
        });
    } catch (err) {
        console.error('❌ Lỗi khi load cabins:', err);
        res.render('vwAdmin/manage-cabin', {
            cabins: [],
            error: 'Không thể tải danh sách cabin'
        });
    }
});

// ==================== CREATE CABIN ====================
router.get('/cabins/add', (req, res) => {
    res.render('vwAdmin/create-cabin', {  });
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
        res.redirect('/vwAdmin/cabins');
    }
});

// ==================== DELETE & CLONE ====================
router.post('/cabins/delete/:id', async (req, res) => {
    await cabinModel.delete(req.params.id);
    res.redirect('/admin/cabins');
});

router.post('/cabins/clone/:id', async (req, res) => {
    try {
        const duplicatedCabin = await cabinModel.duplicateById(req.params.id);
        if (!duplicatedCabin) {
            return res.redirect('/admin/cabins');
        }

        res.redirect(`/admin/cabins/edit/${duplicatedCabin._id}`);
    } catch (err) {
        console.error('❌ Lỗi khi duplicate cabin:', err);
        res.redirect('/admin/cabins');
    }
});

// ==================== SETTINGS & ORDERS ====================
router.get('/settings', async (req, res) => {
    try {
        const settings = await settingModel.getCurrent();

        res.render('vwAdmin/settings', {
            settings
        });
    } catch (err) {
        console.error('❌ Lỗi khi tải settings:', err);
        res.render('vwAdmin/settings', {
            settings: null,
            error: true
        });
    }
});

router.get('/orders', (req, res) => { 
    res.render('vwAdmin/manage-orders', {  }); 
});
router.post('/settings', async (req, res) => {
    try {
        const settings = await settingModel.updateCurrent({
            breakfastPrice: req.body.breakfastPrice,
            miniBookingLength: req.body.minBookingLength,
            maxBookingLength: req.body.maxBookingLength,
            maxNumberOfGuests: req.body.maxGuests
        });

        res.render('vwAdmin/settings', {
            settings,
            success: true
        });

    } catch (err) {
        console.error('❌ Lỗi khi cập nhật settings:', err);

        const fallbackSettings = {
            breakfastPrice: Number(req.body.breakfastPrice) || 15,
            miniBookingLength: Number(req.body.minBookingLength) || 1,
            maxBookingLength: Number(req.body.maxBookingLength) || 30,
            maxNumberOfGuests: Number(req.body.maxGuests) || 10
        };

        res.render('vwAdmin/settings', {
            settings: fallbackSettings,

            error: true
        });
    }
});

export default router;
