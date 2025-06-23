-- CreateEnum
CREATE TYPE "VaiTroNguoiDung" AS ENUM ('QUANTRIVIEN', 'KETOAN');

-- CreateEnum
CREATE TYPE "LoaiHoaDon" AS ENUM ('DAUVAO', 'DAURA');

-- CreateEnum
CREATE TYPE "LoaiDoiTac" AS ENUM ('KHACHHANG', 'NHACUNGCAP');

-- CreateEnum
CREATE TYPE "TrangThaiBaoCao" AS ENUM ('NHAP', 'CHODUYET', 'DADUYET', 'BITUCHOI', 'DANOP');

-- CreateEnum
CREATE TYPE "TrangThaiCongViec" AS ENUM ('DANGCHOLAM', 'HOANTHANH');

-- CreateTable
CREATE TABLE "CongTy" (
    "Id" SERIAL NOT NULL,
    "TenCongTy" VARCHAR(255) NOT NULL,
    "MaSoThue" VARCHAR(20) NOT NULL,
    "DiaChi" TEXT,
    "UrlLogo" TEXT,
    "NgayTao" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CongTy_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "NguoiDung" (
    "Id" SERIAL NOT NULL,
    "IdCongTy" INTEGER NOT NULL,
    "Email" VARCHAR(255) NOT NULL,
    "MatKhauMaHoa" VARCHAR(255) NOT NULL,
    "HoVaTen" VARCHAR(255),
    "VaiTro" "VaiTroNguoiDung" NOT NULL DEFAULT 'KETOAN',
    "DangHoatDong" BOOLEAN DEFAULT true,
    "NgayTao" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "googleAccessToken" TEXT,
    "googleRefreshToken" TEXT,

    CONSTRAINT "NguoiDung_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "DoiTac" (
    "Id" SERIAL NOT NULL,
    "IdCongTy" INTEGER NOT NULL,
    "MaSoThue" VARCHAR(20) NOT NULL,
    "TenDoiTac" VARCHAR(255) NOT NULL,
    "DiaChi" TEXT,
    "LoaiDoiTac" "LoaiDoiTac" NOT NULL,
    "NgayTao" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DoiTac_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "HoaDon" (
    "Id" SERIAL NOT NULL,
    "IdCongTy" INTEGER NOT NULL,
    "IdDoiTac" INTEGER,
    "KyHieuHoaDon" VARCHAR(50),
    "SoHoaDon" VARCHAR(50) NOT NULL,
    "NgayPhatHanh" DATE NOT NULL,
    "LoaiHoaDon" "LoaiHoaDon" NOT NULL,
    "TienTruocThue" DECIMAL(15,2) NOT NULL,
    "ThueSuatVAT" INTEGER NOT NULL,
    "TienThueVAT" DECIMAL(15,2),
    "TongTien" DECIMAL(15,2),
    "MoTa" TEXT,
    "NgayTao" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HoaDon_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "BaoCaoThue" (
    "Id" SERIAL NOT NULL,
    "IdCongTy" INTEGER NOT NULL,
    "IdNguoiTao" INTEGER,
    "NamBaoCao" INTEGER NOT NULL,
    "QuyBaoCao" INTEGER NOT NULL,
    "TongThueDauVao" DECIMAL(15,2) DEFAULT 0.00,
    "TongThueDauRa" DECIMAL(15,2) DEFAULT 0.00,
    "ThuePhaiNop" DECIMAL(15,2) DEFAULT 0.00,
    "TrangThai" "TrangThaiBaoCao" NOT NULL DEFAULT 'NHAP',
    "UrlFileXuat" TEXT,
    "NgayTao" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "NgayCapNhat" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BaoCaoThue_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "LichSuDuyetBaoCao" (
    "Id" SERIAL NOT NULL,
    "IdBaoCaoThue" INTEGER NOT NULL,
    "IdNguoiDuyet" INTEGER NOT NULL,
    "DaDuyet" BOOLEAN NOT NULL,
    "BinhLuan" TEXT,
    "NgayDuyet" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LichSuDuyetBaoCao_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "NhatKyHeThong" (
    "Id" SERIAL NOT NULL,
    "IdNguoiDung" INTEGER,
    "IdCongTy" INTEGER,
    "LoaiHanhDong" VARCHAR(100) NOT NULL,
    "ChiTiet" JSONB,
    "ThoiGian" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NhatKyHeThong_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "CongViec" (
    "Id" SERIAL NOT NULL,
    "IdCongTy" INTEGER NOT NULL,
    "IdNguoiThucHien" INTEGER,
    "TieuDe" VARCHAR(255) NOT NULL,
    "MoTa" TEXT,
    "HanChot" TIMESTAMPTZ(6),
    "TrangThai" "TrangThaiCongViec" NOT NULL DEFAULT 'DANGCHOLAM',
    "IdBaoCaoLienQuan" INTEGER,
    "NgayTao" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CongViec_pkey" PRIMARY KEY ("Id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CongTy_MaSoThue_key" ON "CongTy"("MaSoThue");

-- CreateIndex
CREATE UNIQUE INDEX "NguoiDung_Email_key" ON "NguoiDung"("Email");

-- CreateIndex
CREATE UNIQUE INDEX "DoiTac_IdCongTy_MaSoThue_key" ON "DoiTac"("IdCongTy", "MaSoThue");

-- CreateIndex
CREATE UNIQUE INDEX "HoaDon_IdCongTy_KyHieuHoaDon_SoHoaDon_key" ON "HoaDon"("IdCongTy", "KyHieuHoaDon", "SoHoaDon");

-- CreateIndex
CREATE UNIQUE INDEX "BaoCaoThue_IdCongTy_NamBaoCao_QuyBaoCao_key" ON "BaoCaoThue"("IdCongTy", "NamBaoCao", "QuyBaoCao");

-- AddForeignKey
ALTER TABLE "NguoiDung" ADD CONSTRAINT "NguoiDung_IdCongTy_fkey" FOREIGN KEY ("IdCongTy") REFERENCES "CongTy"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoiTac" ADD CONSTRAINT "DoiTac_IdCongTy_fkey" FOREIGN KEY ("IdCongTy") REFERENCES "CongTy"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HoaDon" ADD CONSTRAINT "HoaDon_IdCongTy_fkey" FOREIGN KEY ("IdCongTy") REFERENCES "CongTy"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HoaDon" ADD CONSTRAINT "HoaDon_IdDoiTac_fkey" FOREIGN KEY ("IdDoiTac") REFERENCES "DoiTac"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BaoCaoThue" ADD CONSTRAINT "BaoCaoThue_IdCongTy_fkey" FOREIGN KEY ("IdCongTy") REFERENCES "CongTy"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BaoCaoThue" ADD CONSTRAINT "BaoCaoThue_IdNguoiTao_fkey" FOREIGN KEY ("IdNguoiTao") REFERENCES "NguoiDung"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LichSuDuyetBaoCao" ADD CONSTRAINT "LichSuDuyetBaoCao_IdBaoCaoThue_fkey" FOREIGN KEY ("IdBaoCaoThue") REFERENCES "BaoCaoThue"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LichSuDuyetBaoCao" ADD CONSTRAINT "LichSuDuyetBaoCao_IdNguoiDuyet_fkey" FOREIGN KEY ("IdNguoiDuyet") REFERENCES "NguoiDung"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NhatKyHeThong" ADD CONSTRAINT "NhatKyHeThong_IdCongTy_fkey" FOREIGN KEY ("IdCongTy") REFERENCES "CongTy"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NhatKyHeThong" ADD CONSTRAINT "NhatKyHeThong_IdNguoiDung_fkey" FOREIGN KEY ("IdNguoiDung") REFERENCES "NguoiDung"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CongViec" ADD CONSTRAINT "CongViec_IdCongTy_fkey" FOREIGN KEY ("IdCongTy") REFERENCES "CongTy"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CongViec" ADD CONSTRAINT "CongViec_IdNguoiThucHien_fkey" FOREIGN KEY ("IdNguoiThucHien") REFERENCES "NguoiDung"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CongViec" ADD CONSTRAINT "CongViec_IdBaoCaoLienQuan_fkey" FOREIGN KEY ("IdBaoCaoLienQuan") REFERENCES "BaoCaoThue"("Id") ON DELETE SET NULL ON UPDATE CASCADE;
