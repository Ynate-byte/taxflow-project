const cron = require('node-cron');
const prisma = require('../config/prisma');
const { sendEmail } = require('./email.service');

// Hàm chính để kiểm tra và gửi nhắc nhở
const checkAndSendReminders = async () => {
    console.log(`[${new Date().toISOString()}] Running daily reminder check...`);
    
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth() + 1;
    
    // Các tháng kết thúc quý: 3, 6, 9, 12
    const quarterEndMonths = [3, 6, 9, 12];

    // Chỉ chạy vào các ngày từ 20 đến 30 của các tháng cuối quý
    if (currentDay < 20 || !quarterEndMonths.includes(currentMonth)) {
        console.log('Not in reminder period. Skipping.');
        return;
    }

    try {
        const companies = await prisma.CongTy.findMany();

        for (const company of companies) {
            const accountants = await prisma.NguoiDung.findMany({
                where: { IdCongTy: company.Id, VaiTro: 'KETOAN', DangHoatDong: true, Email: { not: null } }
            });

            if (accountants.length === 0) continue;
            
            const subject = `[TaxFlow] Nhắc nhở: Sắp đến hạn nộp báo cáo thuế!`;
            const htmlBody = `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <h2>Chào bạn,</h2>
                    <p>Hệ thống TaxFlow xin gửi lời nhắc nhở: Chỉ còn vài ngày nữa là đến hạn chót nộp tờ khai thuế GTGT của quý này.</p>
                    <p>Vui lòng truy cập hệ thống để kiểm tra, hoàn thành và trình duyệt báo cáo sớm để đảm bảo tiến độ.</p>
                    <p>Chúc bạn một ngày làm việc hiệu quả!</p>
                    <p><em>Trân trọng,<br/>Đội ngũ TaxFlow</em></p>
                </div>
            `;

            for (const accountant of accountants) {
                await sendEmail(accountant.Email, subject, htmlBody);
            }
        }
    } catch (error) {
        console.error('Error during reminder check:', error);
    }
};

// Lập lịch chạy hàm trên vào 8:00 sáng mỗi ngày
const initializeScheduler = () => {
    cron.schedule('0 8 * * *', checkAndSendReminders, {
        scheduled: true,
        timezone: "Asia/Ho_Chi_Minh"
    });
    console.log('Email reminder scheduler initialized. Will run every day at 8:00 AM.');
};

module.exports = { initializeScheduler };