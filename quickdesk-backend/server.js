const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path'); // Import the path module

// --- Load environment variables ---
// This ensures the .env file is found correctly from the project root.
dotenv.config({ path: path.join(__dirname, './.env') });

// --- Route imports ---
const authRoutes = require('./routes/auth');
const ticketRoutes = require('./routes/tickets');
const userRoutes = require('./routes/users');
const categoryRoutes = require('./routes/categories');

const app = express();

// --- Middlewares ---
app.use(cors());
app.use(helmet());

// Rate Limiting
const limiter = rateLimit({
  max: 150, // Increased limit slightly
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// Body parser
app.use(express.json({ limit: '10kb' }));


// --- Database Connection ---
const mongoURI = process.env.MONGODB_URI;

if (!mongoURI) {
  console.error('FATAL ERROR: MONGO_URI is not defined in your .env file.');
  process.exit(1); // Exit the application if the database string is missing
}

mongoose.connect(mongoURI)
  .then(() => console.log('DB connection successful!'))
  .catch(err => console.error('!!! DB CONNECTION ERROR !!!', err));


// --- API Routes ---
app.get('/', (req, res) => {
  res.send('QuickDesk API is running...');
});

app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);


// --- Server Initialization ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
