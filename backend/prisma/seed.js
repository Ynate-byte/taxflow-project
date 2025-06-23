const { execSync } = require('child_process');
const dotenv = require('dotenv');
const path = require('path');

// Tải các biến môi trường từ file .env (nằm ở thư mục backend/)
// Đây là điều quan trọng nếu bạn chạy seed script cục bộ
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function main() {
  console.log('Bắt đầu chạy script seeding JavaScript...');
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('Lỗi: Biến môi trường DATABASE_URL không được định nghĩa.');
    console.error('Vui lòng đảm bảo DATABASE_URL đã được cấu hình trong backend/.env của bạn.');
    process.exit(1);
  }

  // ĐỊNH NGHĨA ĐƯỜNG DẪN ĐẦY ĐỦ ĐẾN FILE psql.exe CỦA BẠN TRÊN WINDOWS
  // Dựa trên thông tin bạn đã cung cấp: C:\Program Files\PostgreSQL\17\bin\psql.exe
  const psqlExecutablePath = 'C:\\Program Files\\PostgreSQL\\17\\bin\\psql.exe'; 

  // Kiểm tra sơ bộ xem psql.exe có tồn tại và chạy được không
  try {
    execSync(`"${psqlExecutablePath}" --version`, { stdio: 'ignore' });
  } catch (e) {
    console.error(`\nLỖI: Không thể tìm thấy hoặc chạy psql.exe tại đường dẫn: "${psqlExecutablePath}"`);
    console.error('Vui lòng kiểm tra lại:');
    console.error('  1. Bạn đã cài đặt PostgreSQL cho Windows chưa?');
    console.error('  2. Đường dẫn trên (psqlExecutablePath) có đúng với vị trí cài đặt psql.exe của bạn không?');
    console.error('  3. Thử đóng tất cả Terminal và mở lại rồi chạy psql --version');
    process.exit(1);
  }


  try {
    // Xây dựng lệnh psql để thực thi file seed.sql
    // Sử dụng TEMPLATE LITERALS (dấu backticks ` `) để thay thế biến ${}
    // Bao quanh các đường dẫn và URL bằng dấu nháy kép ("") để xử lý khoảng trắng trong đường dẫn
    const psqlCommand = `"${psqlExecutablePath}" "${databaseUrl}" -f "${path.join(__dirname, 'seed.sql')}"`; 

    console.log(`Đang thực thi lệnh: ${psqlCommand}`);
    // 'stdio: inherit' giúp hiển thị trực tiếp output của psql trong Terminal
    execSync(psqlCommand, { stdio: 'inherit' }); 

    console.log('Chạy seeding SQL hoàn tất thành công!');
  } catch (error) {
    console.error('\nLỖI LỚN khi chạy seeding SQL:');
    console.error('Thông báo lỗi từ Node.js:', error.message);
    console.error('Thông báo lỗi chi tiết từ psql (nếu có):', error.stderr ? error.stderr.toString() : 'Không có thông báo lỗi chi tiết từ psql.');
    console.error('Vui lòng kiểm tra:');
    console.error('  1. DATABASE_URL trong backend/.env có chính xác không (user, password, host, dbname).');
    console.error('  2. Bạn có kết nối internet để truy cập database Render không.');
    console.error('  3. File backend/prisma/seed.sql có tồn tại và đúng định dạng không.');
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error('\nLỗi không xác định trong quá trình seed:', e);
    process.exit(1);
  });