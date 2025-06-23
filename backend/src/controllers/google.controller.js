const { google } = require('googleapis');
const prisma = require('../config/prisma');
const xlsx = require('xlsx');
const { logAction } = require('../services/logging.service');

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);


exports.getAuthUrl = (req, res) => {
    const scopes = [
        'https://www.googleapis.com/auth/gmail.readonly'
    ];

    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        state: req.user.id.toString()
    });

    // Thay đổi ở đây: Trả về URL dưới dạng JSON
    res.status(200).json({ authUrl: url });
};

/**
 * Xử lý callback sau khi người dùng chấp thuận hoặc từ chối quyền.
 */
exports.handleGoogleCallback = async (req, res) => {
    const { code, state: userId } = req.query;

    if (!code || !userId) {
        return res.redirect('http://localhost:5173/settings?status=google_error');
    }

    try {
        const { tokens } = await oauth2Client.getToken(code);
        
        await prisma.NguoiDung.update({
            where: { Id: parseInt(userId) },
            data: {
                googleAccessToken: tokens.access_token,
                googleRefreshToken: tokens.refresh_token,
            }
        });
        
        res.redirect('http://localhost:5173/settings?status=google_connected');
    } catch (error) {
        console.error('Error getting Google tokens:', error);
        res.redirect('http://localhost:5173/settings?status=google_error');
    }
};

/**
 * Quét hòm thư của người dùng để tìm và xử lý các hóa đơn.
 */
exports.scanInvoices = async (req, res) => {
    const { id: userId, companyId } = req.user;
    try {
        const user = await prisma.NguoiDung.findUnique({ where: { Id: userId } });

        if (!user || !user.googleAccessToken) {
            return res.status(400).json({ message: "Vui lòng kết nối tài khoản Google trước." });
        }
        
        oauth2Client.setCredentials({
            access_token: user.googleAccessToken,
            refresh_token: user.googleRefreshToken,
        });

        const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

        const searchResult = await gmail.users.messages.list({
            userId: 'me',
            q: 'has:attachment (filename:xlsx OR filename:csv) "hóa đơn"',
            maxResults: 10,
        });

        if (!searchResult.data.messages || searchResult.data.messages.length === 0) {
            return res.status(200).json({ message: "Không tìm thấy email chứa hóa đơn mới nào." });
        }

        let addedCount = 0;
        
        for (const messageInfo of searchResult.data.messages) {
            const message = await gmail.users.messages.get({ userId: 'me', id: messageInfo.id });
            const attachments = message.data.payload.parts.filter(part => 
                part.filename && (part.filename.endsWith('.xlsx') || part.filename.endsWith('.csv'))
            );

            for (const part of attachments) {
                const attachment = await gmail.users.messages.attachments.get({
                    userId: 'me',
                    messageId: messageInfo.id,
                    id: part.body.attachmentId
                });

                const fileBuffer = Buffer.from(attachment.data.data, 'base64');
                const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const data = xlsx.utils.sheet_to_json(sheet, { cellDates: true });
                
                const invoicesToCreate = data
                    .filter(row => row.SoHoaDon && row.NgayPhatHanh && row.TienTruocThue != null && row.ThueSuatVAT != null)
                    .map(row => ({
                        IdCongTy: companyId,
                        KyHieuHoaDon: row.KyHieuHoaDon || '',
                        SoHoaDon: String(row.SoHoaDon),
                        NgayPhatHanh: new Date(row.NgayPhatHanh),
                        LoaiHoaDon: String(row.LoaiHoaDon).toUpperCase() === 'DAUVAO' ? 'DAUVAO' : 'DAURA',
                        TienTruocThue: parseFloat(row.TienTruocThue),
                        ThueSuatVAT: parseInt(row.ThueSuatVAT),
                    }));
                
                if (invoicesToCreate.length > 0) {
                    const result = await prisma.HoaDon.createMany({ 
                        data: invoicesToCreate, 
                        skipDuplicates: true
                    });
                    addedCount += result.count;
                }
            }
        }
        
        await logAction(userId, companyId, 'SCAN_GMAIL_INVOICES', { found: searchResult.data.messages.length, added: addedCount });
        res.status(200).json({ message: `Quét hoàn tất! Đã thêm ${addedCount} hóa đơn mới.` });

    } catch (error) {
        console.error("Lỗi khi quét email:", error);
        res.status(500).json({ message: "Đã xảy ra lỗi khi quét email. Có thể bạn cần kết nối lại tài khoản Google." });
    }
};
