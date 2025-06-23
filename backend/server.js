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
const googleRoutes = require('./src/api/google.routes');

const app = express();

// Định nghĩa và sử dụng CORS CHỈ MỘT LẦN VỚI CẤU HÌNH CỤ THỂ
const corsOptions = {
    origin: 'https://taxflow-project-frontend.vercel.app', // <-- Đảm bảo dòng này CHÍNH XÁC
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
};
app.use(cors(corsOptions)); // <--- CHỈ DÙNG DÒNG NÀY

app.use(express.json()); // Dòng này giữ nguyên vị trí, sau CORS

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

app.listen(PORT, () => {
     console.log(`Server is running on port ${PORT}.`);
     // Khởi động bộ lập lịch
     initializeScheduler();
});