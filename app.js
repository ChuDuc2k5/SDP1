import express from 'express';
import { engine } from 'express-handlebars';
import cabinRoute from './routes/cabin.route.js';
import userRoute from './routes/user.route.js'; // Import route cho phần Account/Guest
import bookingRoute from './routes/booking.route.js'; // Import route cho phần Booking

const app = express();
const port = 3000;

// Cấu hình View Engine là Handlebars với Helpers
app.engine('handlebars', engine({
    defaultLayout: 'main',
    helpers: {
        // Định nghĩa helper "eq" để so sánh bằng trong giao diện
        eq: function (a, b) {
            return a === b;
        }
    }
}));
app.set('view engine', 'handlebars');
app.set('views', './views');

// Middleware
app.use(express.static('public')); 
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Hỗ trợ đọc dữ liệu từ form sau này

// Các tuyến đường (Routes)
app.use('/cabins', cabinRoute);
app.use('/account', userRoute); // Route cho trang cá nhân của khách vãng lai (Kha đảm nhiệm)
app.use('/booking', bookingRoute); // Route cho phần Booking (chuduc đảm nhiệm)
// Tuyến đường (Route) mặc định
app.get('/', (req, res) => {
    res.render('about'); 
});

app.listen(port, () => console.log(`Server đang chạy tại http://localhost:${port}`));