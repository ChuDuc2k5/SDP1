import express from "express";
import { engine } from "express-handlebars";
import cabinRoute from "./routes/cabin.route.js";
import accountRoutes from "./routes/account.routes.js";
import userRoutes from "./routes/user.route.js"; // Import route cho phần Account/Guest
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";
import { verifyToken } from "./utils/token.js";

const app = express();
const port = 3000;
app.use(cookieParser());
app.use((req, res, next) => {
  const token = req.cookies.token;

  if (token) {
    try {
      const decoded = verifyToken(token);
      res.locals.user = decoded;
    } catch (err) {
      res.locals.user = null;
    }
  } else {
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
    },
  }),
);
app.set("view engine", "handlebars");
app.set("views", "./views");

// Middleware
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Hỗ trợ đọc dữ liệu từ form sau này

// Các tuyến đường (Routes)
app.use("/cabins", cabinRoute);
app.use("/account", accountRoutes); // Route cho trang cá nhân của khách vãng lai (Kha đảm nhiệm)
app.use("/auth", authRoutes);
app.use("/user", userRoutes);

// Tuyến đường (Route) mặc định
app.get("/", (req, res) => {
  res.render('about');
});

app.listen(port, () =>
  console.log(`Server đang chạy tại http://localhost:${port}`),
);
