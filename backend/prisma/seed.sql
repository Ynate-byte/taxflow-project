-- =======================================================================================
-- ==                                                                                 ==
-- ==   DỰ ÁN: TAXFLOW - HỆ THỐNG TỰ ĐỘNG HÓA KÊ KHAI THUẾ GTGT                         ==
-- ==   TÁC GIẢ: [Tên của bạn]                                                         ==
-- ==   PHIÊN BẢN: 2.4 (Bổ sung Views, Indexes và hoàn thiện dữ liệu)                  ==
-- ==   NGÀY CẬP NHẬT: 23-06-2025                                                      ==
-- ==   DATABASE: taxflowdb                                                           ==
-- ==                                                                                 ==
-- ==   MÔ TẢ: Script này sẽ khởi tạo lại toàn bộ CSDL và chèn dữ liệu mẫu phong phú.  ==
-- ==                                                                                 ==
-- =======================================================================================

-- ========= PHẦN 0: DỌN DẸP TOÀN BỘ CẤU TRÚC CŨ =========
DROP TYPE IF EXISTS "VaiTroNguoiDung" CASCADE;
DROP TYPE IF EXISTS "LoaiHoaDon" CASCADE;
DROP TYPE IF EXISTS "LoaiDoiTac" CASCADE;
DROP TYPE IF EXISTS "TrangThaiBaoCao" CASCADE;
DROP TYPE IF EXISTS "TrangThaiCongViec" CASCADE;

DROP TABLE IF EXISTS "NhatKyHeThong" CASCADE;
DROP TABLE IF EXISTS "LichSuDuyetBaoCao" CASCADE;
DROP TABLE IF EXISTS "CongViec" CASCADE;
DROP TABLE IF EXISTS "BaoCaoThue" CASCADE;
DROP TABLE IF EXISTS "HoaDon" CASCADE;
DROP TABLE IF EXISTS "DoiTac" CASCADE;
DROP TABLE IF EXISTS "NguoiDung" CASCADE;
DROP TABLE IF EXISTS "CongTy" CASCADE;

-- ========= PHẦN I: ĐỊNH NGHĨA LẠI CÁC KIỂU DỮ LIỆU (ENUMS) =========
CREATE TYPE "VaiTroNguoiDung" AS ENUM ('QUANTRIVIEN', 'KETOAN');
CREATE TYPE "LoaiHoaDon" AS ENUM ('DAUVAO', 'DAURA');
CREATE TYPE "LoaiDoiTac" AS ENUM ('KHACHHANG', 'NHACUNGCAP');
CREATE TYPE "TrangThaiBaoCao" AS ENUM ('NHAP', 'CHODUYET', 'DADUYET', 'BITUCHOI', 'DANOP');
CREATE TYPE "TrangThaiCongViec" AS ENUM ('DANGCHOLAM', 'HOANTHANH');


-- ========= PHẦN II: TẠO LẠI CÁC BẢNG (TABLES) =========
CREATE TABLE "CongTy" (
    "Id" SERIAL PRIMARY KEY, "TenCongTy" VARCHAR(255) NOT NULL, "MaSoThue" VARCHAR(20) UNIQUE NOT NULL,
    "DiaChi" TEXT, "UrlLogo" TEXT, "NgayTao" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE "NguoiDung" (
    "Id" SERIAL PRIMARY KEY, "IdCongTy" INTEGER NOT NULL REFERENCES "CongTy"("Id") ON DELETE CASCADE,
    "Email" VARCHAR(255) UNIQUE NOT NULL, "MatKhauMaHoa" VARCHAR(255) NOT NULL, "HoVaTen" VARCHAR(255),
    "VaiTro" "VaiTroNguoiDung" NOT NULL DEFAULT 'KETOAN', "DangHoatDong" BOOLEAN DEFAULT TRUE,
    "NgayTao" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP, "googleAccessToken" TEXT, "googleRefreshToken" TEXT
);
CREATE TABLE "DoiTac" (
    "Id" SERIAL PRIMARY KEY, "IdCongTy" INTEGER NOT NULL REFERENCES "CongTy"("Id") ON DELETE CASCADE,
    "MaSoThue" VARCHAR(20) NOT NULL, "TenDoiTac" VARCHAR(255) NOT NULL, "DiaChi" TEXT,
    "LoaiDoiTac" "LoaiDoiTac" NOT NULL, "NgayTao" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP, UNIQUE ("IdCongTy", "MaSoThue")
);
CREATE TABLE "HoaDon" (
    "Id" SERIAL PRIMARY KEY, "IdCongTy" INTEGER NOT NULL REFERENCES "CongTy"("Id") ON DELETE CASCADE,
    "IdDoiTac" INTEGER REFERENCES "DoiTac"("Id") ON DELETE SET NULL, "KyHieuHoaDon" VARCHAR(50),
    "SoHoaDon" VARCHAR(50) NOT NULL, "NgayPhatHanh" DATE NOT NULL, "LoaiHoaDon" "LoaiHoaDon" NOT NULL,
    "TienTruocThue" NUMERIC(15, 2) NOT NULL, "ThueSuatVAT" INTEGER NOT NULL, "TienThueVAT" NUMERIC(15, 2),
    "TongTien" NUMERIC(15, 2), "MoTa" TEXT, "NgayTao" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE ("IdCongTy", "KyHieuHoaDon", "SoHoaDon")
);
CREATE TABLE "BaoCaoThue" (
    "Id" SERIAL PRIMARY KEY, "IdCongTy" INTEGER NOT NULL REFERENCES "CongTy"("Id") ON DELETE CASCADE,
    "IdNguoiTao" INTEGER REFERENCES "NguoiDung"("Id") ON DELETE SET NULL, "NamBaoCao" INTEGER NOT NULL,
    "QuyBaoCao" INTEGER NOT NULL CHECK ("QuyBaoCao" BETWEEN 1 AND 4), "TongThueDauVao" NUMERIC(15, 2) DEFAULT 0.00,
    "TongThueDauRa" NUMERIC(15, 2) DEFAULT 0.00, "ThuePhaiNop" NUMERIC(15, 2) DEFAULT 0.00,
    "TrangThai" "TrangThaiBaoCao" NOT NULL DEFAULT 'NHAP', "UrlFileXuat" TEXT,
    "NgayTao" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP, "NgayCapNhat" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE ("IdCongTy", "NamBaoCao", "QuyBaoCao")
);
CREATE TABLE "LichSuDuyetBaoCao" (
    "Id" SERIAL PRIMARY KEY, "IdBaoCaoThue" INTEGER NOT NULL REFERENCES "BaoCaoThue"("Id") ON DELETE CASCADE,
    "IdNguoiDuyet" INTEGER NOT NULL REFERENCES "NguoiDung"("Id") ON DELETE CASCADE, "DaDuyet" BOOLEAN NOT NULL,
    "BinhLuan" TEXT, "NgayDuyet" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE "NhatKyHeThong" (
    "Id" SERIAL PRIMARY KEY, "IdNguoiDung" INTEGER REFERENCES "NguoiDung"("Id") ON DELETE SET NULL,
    "IdCongTy" INTEGER REFERENCES "CongTy"("Id") ON DELETE CASCADE, "LoaiHanhDong" VARCHAR(100) NOT NULL,
    "ChiTiet" JSONB, "ThoiGian" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE "CongViec" (
    "Id" SERIAL PRIMARY KEY, "IdCongTy" INTEGER NOT NULL REFERENCES "CongTy"("Id") ON DELETE CASCADE,
    "IdNguoiThucHien" INTEGER REFERENCES "NguoiDung"("Id") ON DELETE SET NULL, "TieuDe" VARCHAR(255) NOT NULL,
    "MoTa" TEXT, "HanChot" TIMESTAMPTZ, "TrangThai" "TrangThaiCongViec" NOT NULL DEFAULT 'DANGCHOLAM',
    "IdBaoCaoLienQuan" INTEGER REFERENCES "BaoCaoThue"("Id") ON DELETE SET NULL, "NgayTao" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);


-- ========= PHẦN III: HÀM (FUNCTIONS) VÀ TRÌNH KÍCH HOẠT (TRIGGERS) =========
CREATE OR REPLACE FUNCTION "FN_CapNhatThoiGian"() RETURNS TRIGGER AS $$ BEGIN NEW."NgayCapNhat" = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;
CREATE OR REPLACE FUNCTION "FN_TinhToanGiaTriHoaDon"() RETURNS TRIGGER AS $$ BEGIN NEW."TienThueVAT" := NEW."TienTruocThue" * NEW."ThueSuatVAT" / 100; NEW."TongTien" := NEW."TienTruocThue" + NEW."TienThueVAT"; RETURN NEW; END; $$ LANGUAGE plpgsql;
CREATE TRIGGER "TG_HoaDon_TinhToanTuDong" BEFORE INSERT OR UPDATE ON "HoaDon" FOR EACH ROW EXECUTE FUNCTION "FN_TinhToanGiaTriHoaDon"();
CREATE TRIGGER "TG_BaoCaoThue_CapNhatThoiGian" BEFORE UPDATE ON "BaoCaoThue" FOR EACH ROW EXECUTE FUNCTION "FN_CapNhatThoiGian"();


-- ========= PHẦN IV: KHUNG NHÌN (VIEWS) - ĐÃ BỔ SUNG LẠI =========
CREATE OR REPLACE VIEW "V_ChiTietHoaDon" AS
SELECT
    hd."Id", hd."IdCongTy", hd."KyHieuHoaDon", hd."SoHoaDon", hd."NgayPhatHanh", hd."LoaiHoaDon", hd."TienTruocThue",
    hd."ThueSuatVAT", hd."TienThueVAT", hd."TongTien", dt."TenDoiTac", dt."MaSoThue" AS "MaSoThueDoiTac"
FROM "HoaDon" hd
LEFT JOIN "DoiTac" dt ON hd."IdDoiTac" = dt."Id";

CREATE OR REPLACE VIEW "V_ChiTietBaoCaoThue" AS
SELECT
    bct."Id", bct."IdCongTy", ct."TenCongTy", bct."NamBaoCao", bct."QuyBaoCao", bct."TongThueDauVao", bct."TongThueDauRa",
    bct."ThuePhaiNop", bct."TrangThai", bct."IdNguoiTao", nd."HoVaTen" AS "TenNguoiTao", bct."NgayTao", bct."NgayCapNhat"
FROM "BaoCaoThue" bct
JOIN "CongTy" ct ON bct."IdCongTy" = ct."Id"
LEFT JOIN "NguoiDung" nd ON bct."IdNguoiTao" = nd."Id";


-- ========= PHẦN V: CHỈ MỤC (INDEXES) - ĐÃ BỔ SUNG LẠI =========
CREATE INDEX "IdxNguoiDungCongTy" ON "NguoiDung"("IdCongTy");
CREATE INDEX "IdxDoiTacCongTy" ON "DoiTac"("IdCongTy");
CREATE INDEX "IdxHoaDonCongTy" ON "HoaDon"("IdCongTy");
CREATE INDEX "IdxHoaDonNgayPhatHanh" ON "HoaDon"("NgayPhatHanh");
CREATE INDEX "IdxBaoCaoThueCongTy" ON "BaoCaoThue"("IdCongTy");
CREATE INDEX "IdxLichSuDuyetBaoCao" ON "LichSuDuyetBaoCao"("IdBaoCaoThue");
CREATE INDEX "IdxNhatKyHeThongNguoiDung" ON "NhatKyHeThong"("IdNguoiDung");
CREATE INDEX "IdxCongViecNguoiThucHien" ON "CongViec"("IdNguoiThucHien");


-- ========= PHẦN VI: CHÈN DỮ LIỆU MẪU (SAMPLE DATA) =========
BEGIN;

INSERT INTO "CongTy"("TenCongTy", "MaSoThue", "DiaChi") VALUES
('Công ty TNHH Giải Pháp ABC', '0313222888', '123 Võ Văn Tần, Phường 6, Quận 3, TP. Hồ Chí Minh'),
('Tập đoàn Công nghệ DEF', '0101234567', 'Tòa nhà Keangnam, Phạm Hùng, Nam Từ Liêm, Hà Nội');

INSERT INTO "NguoiDung"("IdCongTy", "Email", "MatKhauMaHoa", "HoVaTen", "VaiTro") VALUES
(1, 'admin.abc@taxflow.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Nguyễn Văn Admin', 'QUANTRIVIEN'),
(1, 'ketoan.abc@taxflow.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Trần Thị Kế Toán', 'KETOAN'),
(2, 'admin.def@taxflow.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Lê Minh Quản Trị', 'QUANTRIVIEN');

INSERT INTO "DoiTac"("IdCongTy", "MaSoThue", "TenDoiTac", "DiaChi", "LoaiDoiTac") VALUES
(1, '0314555666', 'Công ty Cung ứng Vật tư XYZ', '456 Lê Lợi, Quận 1, TP. HCM', 'NHACUNGCAP'),
(1, '0108777999', 'Công ty Cổ phần Thương mại Toàn Cầu', '789 Nguyễn Huệ, Quận 1, TP. HCM', 'KHACHHANG');

INSERT INTO "HoaDon"("IdCongTy", "IdDoiTac", "KyHieuHoaDon", "SoHoaDon", "NgayPhatHanh", "LoaiHoaDon", "TienTruocThue", "ThueSuatVAT") VALUES
(1, 1, 'AB/25E', '0000123', '2025-01-15', 'DAUVAO', 15000000, 10),
(1, 1, 'AB/25E', '0000124', '2025-02-20', 'DAUVAO', 25000000, 8),
(1, 2, 'BC/25T', '0000882', '2025-03-25', 'DAURA', 30000000, 10),
(1, 2, 'BC/25T', '0000881', '2025-06-10', 'DAURA', 50000000, 10);

INSERT INTO "BaoCaoThue"("IdCongTy", "IdNguoiTao", "NamBaoCao", "QuyBaoCao", "TrangThai") VALUES
(1, 2, 2025, 1, 'CHODUYET'),
(1, 2, 2025, 2, 'DADUYET'),
(1, 2, 2024, 4, 'BITUCHOI');

INSERT INTO "LichSuDuyetBaoCao"("IdBaoCaoThue", "IdNguoiDuyet", "DaDuyet", "BinhLuan") VALUES
(2, 1, TRUE, 'Đã duyệt báo cáo Quý 2.'),
(3, 1, FALSE, 'Số liệu đầu vào không khớp, cần kiểm tra lại.');

INSERT INTO "CongViec"("IdCongTy", "IdNguoiThucHien", "TieuDe", "MoTa", "HanChot", "IdBaoCaoLienQuan", "TrangThai") VALUES
(1, 2, 'Hoàn thành đối chiếu hóa đơn Quý 2/2025', 'Đối chiếu tất cả hóa đơn đầu vào và đầu ra của quý 2', '2025-07-15 17:00:00', 2, 'HOANTHANH'),
(1, 2, 'Nộp tờ khai thuế Quý 2/2025', 'Sau khi báo cáo được duyệt, tiến hành nộp qua hệ thống điện tử.', '2025-07-30 17:00:00', 2, 'DANGCHOLAM');

INSERT INTO "NhatKyHeThong"("IdNguoiDung", "IdCongTy", "LoaiHanhDong", "ChiTiet") VALUES
(1, 1, 'USER_LOGIN', '{}'),
(2, 1, 'UPLOAD_INVOICES', '{"file": "bangke_q1.xlsx", "addedCount": 4}'),
(2, 1, 'SUBMIT_REPORT', '{"reportId": 1}');

COMMIT;


-- ========= PHẦN VII: KIỂM TRA DỮ LIỆU =========
SELECT * FROM "CongTy";
SELECT * FROM "NguoiDung";
SELECT * FROM "DoiTac";
SELECT * FROM "HoaDon" ORDER BY "NgayPhatHanh";
SELECT * FROM "BaoCaoThue" ORDER BY "NamBaoCao", "QuyBaoCao";
SELECT * FROM "LichSuDuyetBaoCao";
SELECT * FROM "CongViec";
SELECT * FROM "NhatKyHeThong" ORDER BY "ThoiGian" DESC;

UPDATE "NguoiDung"
SET "MatKhauMaHoa" = '$2a$12$.Jp39Vq7vXRHg6z5XmlLu.cz.h9TQboI3XI9ZdVUlH3zhjFIzD3D6';