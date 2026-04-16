import express from 'express';
import { engine } from 'express-handlebars';
import adminRoute from './routes/admin.route.js';
import cabinRoute from "./routes/cabin.route.js";
import bookingRoute from "./routes/booking.route.js";
import accountRoutes from "./routes/account.routes.js";
import userRoutes from "./routes/user.route.js";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";
import { verifyToken } from "./utils/token.js";
import session from 'express-session';

const app = express();
const port = 3000;
app.use(cookieParser());
app.use(session({
    secret: 'sdp1-secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));
app.use((req, res, next) => {
    const token = req.cookies.token;

    if (token) {
        try {
            const decoded = verifyToken(token);
            req.session.user = {
                ...decoded,
                _id: decoded.id
            };
            res.locals.user = req.session.user;
        } catch (err) {
            req.session.user = null;
            res.locals.user = null;
        }
    } else {
        req.session.user = null;
        res.locals.user = null;
    }

    next();
});

// Cấu hình View Engine là Handlebars với Helpers
app.engine(
    "handlebars",
    engine({
        defaultLayout: "main",
        helpers: {
            // Định nghĩa helper "eq" để so sánh bằng trong giao diện
            eq: function (a, b) {
                return a === b;
            },
            // Format date for display
            formatDate: function (date, format) {
                if (!date) return '';
                const d = new Date(date);
                if (format === 'YYYY-MM-DD') {
                    const year = d.getFullYear();
                    const month = String(d.getMonth() + 1).padStart(2, '0');
                    const day = String(d.getDate()).padStart(2, '0');
                    return `${year}-${month}-${day}`;
                }
                return d.toLocaleDateString();
            },
        },
    }),
);
app.set("view engine", "handlebars");
app.set("views", "./views");

// Middleware
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Hỗ trợ đọc dữ liệu từ form sau này
app.use(session({
    secret: 'sdp1-secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));
app.use((req, res, next) => {
    res.locals.currentUser = req.session.user;
    next();
});

// Các tuyến đường (Routes)
app.use("/cabins", cabinRoute);
app.use("/booking", bookingRoute);
app.use("/account", accountRoutes); // Route cho trang cá nhân của khách vãng lai (Kha đảm nhiệm)
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use('/admin', adminRoute);

// Tuyến đường (Route) mặc định
app.get("/", (req, res) => {
    res.render('about');
});
// Thêm Route xử lý Logout
app.get('/logout', (req, res) => {
    // Nếu sau này team dùng express-session, bạn sẽ thêm lệnh: req.session.destroy();
    // Hiện tại chỉ cần redirect về trang chủ là xong.
    res.redirect('/');
});

app.listen(port, () =>
    console.log(`Server đang chạy tại http://localhost:${port}`),
);
