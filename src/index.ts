import express from 'express';
import dotenv from 'dotenv'
import connectDB from './config/database.ts';
import Catrouter from './routes/categoryRoutes.ts';
import Prodrouter from './routes/productRoutes.ts';
import Clientrouter from './routes/clientRoutes.ts';
import Adminrouter from './routes/adminRoutes.ts';
import cartRoutes from './routes/cartRoutes.ts';
import Ordrouter from './routes/orderRoutes.ts';

dotenv.config();

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to 3D Marketplace API' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// API Routes
app.use('/api/category', Catrouter);
app.use('/api/products', Prodrouter);
app.use('/api/client', Clientrouter);
app.use('/api/admin', Adminrouter);
app.use('/api/carts', cartRoutes);
app.use('/api/orders', Ordrouter);

const PORT = process.env.PORT || 3000;

// Connect to database first, then start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
  });
});