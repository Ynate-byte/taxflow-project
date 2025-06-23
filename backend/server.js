require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initializeScheduler } = require('./src/services/scheduler.service');

// Import routes
const authRoutes = require('./src/api/auth.routes');
const userRoutes = require('./src/api/user.routes');
const invoiceRoutes = require('./src/api/invoice.routes');
const reportRoutes = require('./src/api/report.routes');
const partnerRoutes = require('./src/api/partner.routes');
const logRoutes = require('./src/api/log.routes');
const taskRoutes = require('./src/api/task.routes');
const googleRoutes = require('./src/api/google.routes'); // MỚI

const app = express();

app.use(cors());
app.use(express.json());

// Sử dụng các routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api', googleRoutes);

app.get('/', (req, res) => {
    res.send('TaxFlow API is running!');
});

const PORT = process.env.PORT || 8080;
const corsOptions = {
    // Thay thế bằng URL chính xác của frontend Vercel của bạn
    origin: 'https://taxflow-project-frontend.vercel.app', // <--- DÁN URL FRONTTEND VÀO ĐÂY
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
    // Khởi động bộ lập lịch
    initializeScheduler();
});