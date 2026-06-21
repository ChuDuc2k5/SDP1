import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import express from "express";
import { engine } from "express-handlebars";
import session from "express-session";
import authController from "./controllers/auth.controller.js";
import { renderHome } from "./controllers/home.controller.js";
import { attachUser } from "./middlewares/auth.middleware.js";
import accountRoutes from "./routes/account.routes.js";
import adminRoute from "./routes/admin.route.js";
import authRoutes from "./routes/auth.routes.js";
import bookingRoute from "./routes/booking.route.js";
import cabinRoute from "./routes/cabin.route.js";
import rateRoutes from "./routes/rate.route.js";
import userRoutes from "./routes/user.route.js";

dotenv.config({ quiet: true });

const app = express();
const port = process.env.PORT || 3000;

app.engine(
  "handlebars",
  engine({
    defaultLayout: "main",
    helpers: {
      eq: (a, b) => a === b,
      formatDate: (date, format) => {
        if (!date) return "";
        const d = new Date(date);
        if (Number.isNaN(d.getTime())) return "";
        if (format === "YYYY-MM-DD") {
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, "0");
          const day = String(d.getDate()).padStart(2, "0");
          return `${year}-${month}-${day}`;
        }
        if (format === "MMM DD, YYYY") {
          return d.toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
          });
        }
        return d.toLocaleDateString();
      },
    },
  }),
);

app.set("view engine", "handlebars");
app.set("views", "./views");

app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "sdp1-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  }),
);
app.use(attachUser);
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/cabins", cabinRoute);
app.use("/booking", bookingRoute);
app.use("/account", accountRoutes);
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/rates", rateRoutes);
app.use("/admin", adminRoute);

app.get("/", renderHome);

app.get("/logout", authController.logout);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
