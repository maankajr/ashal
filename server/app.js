import express from "express";
import cors from "cors";
import { createCorsOptions } from "./src/config/cors.js";
import { createRequestId } from "./src/utils/response.js";
import { errorHandler, notFoundHandler } from "./src/middleware/errorHandler.js";
import authRoutes from "./src/routes/auth.routes.js";
import productRoutes from "./src/routes/product.routes.js";
import categoryRoutes from "./src/routes/category.routes.js";
import cartRoutes from "./src/routes/cart.routes.js";
import vendorRoutes from "./src/routes/vendor.routes.js";
import orderRoutes from "./src/routes/order.routes.js";
import userRoutes from "./src/routes/user.routes.js";
import wishlistRoutes from "./src/routes/wishlist.routes.js";
import adminRoutes from "./src/routes/admin.routes.js";

const app = express();

app.use((req, _res, next) => {
  req.requestId = createRequestId();
  next();
});

app.use(cors(createCorsOptions()));

app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    data: {
      status: "ok",
      service: "ashal-api",
    },
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/vendor", vendorRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
