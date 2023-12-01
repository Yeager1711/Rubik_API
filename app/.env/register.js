const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const crypto = require('crypto');
const fileUpload = require('express-fileupload');
const fs = require('fs');

module.exports = router;

const app = express();
const port = 3002;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(cors());

app.get('/', (req, res) => {
  res.send("Welcome to the Registration API");
});

app.post('/api/register', (req, res) => {
  const formData = req.body;

  const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'rubik',
  });

  db.connect((err) => {
    if (err) {
      console.error('Lỗi kết nối cơ sở dữ liệu: ' + err.stack);
      return res.status(500).json({ error: 'Lỗi kết nối cơ sở dữ liệu' });
    }

    const usernameCheckQuery = 'SELECT COUNT(*) as count FROM user WHERE username = ?';
    db.query(usernameCheckQuery, [formData.username], (error, results) => {
      if (error) {
        console.error('Lỗi trong quá trình kiểm tra đăng nhập:' + error);
        db.end();
        return res.status(500).json({ error: 'Lỗi trong quá trình kiểm tra đăng nhập.' });
      }

      const usernameExists = results[0].count > 0;
      if (usernameExists) {
        db.end();
        return res.status(400).json({ error: 'Tên đăng nhập đã tồn tại.' });
      }

      if (!req.files || !req.files.avatar) {
        db.end();
        return res.status(400).json({ error: 'Không có tệp hình ảnh được tải lên.' });
      }

      const avatar = req.files.avatar;
      const avatarFileName = `${Date.now()}_${avatar.name}`;
      const uploadDirectory = './uploads';

      if (!fs.existsSync(uploadDirectory)) {
        fs.mkdirSync(uploadDirectory);
      }

      const avatarPath = `${uploadDirectory}/${avatarFileName}`;

      avatar.mv(avatarPath, (err) => {
        if (err) {
          console.error('Lỗi khi lưu trữ hình ảnh: ' + err);
          db.end();
          return res.status(500).json({ error: 'Lỗi khi lưu trữ hình ảnh' });
        }

        // Mã hóa mật khẩu bằng MD5
        const hashedPassword = crypto.createHash('md5').update(formData.password).digest('hex');

        const userCountQuery = 'SELECT COUNT(*) as userCount FROM user';
        db.query(userCountQuery, (err, results) => {
          if (err) {
            console.error('Lỗi khi lấy số lượng người dùng: ' + err);
            db.end();
            return res.status(500).json({ error: 'Lỗi khi lấy số lượng người dùng' });
          }

          const userCount = results[0].userCount;
          const role_id = userCount === 0 ? 1 : 2;

          const base64Image = avatar.data.toString('base64');

          const insertUserQuery = 'INSERT INTO user (full_name, phone_number, address, email, dateOfBirth, username, password, gender, role_id, avatar) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
          const insertValues = [formData.full_name, formData.phone_number, formData.address, formData.email, formData.dateOfBirth, formData.username, hashedPassword, formData.gender, role_id, base64Image];

          db.query(insertUserQuery, insertValues, (err, insertResults) => {
            if (err) {
              console.error('Lỗi khi thêm người dùng: ' + err);
              db.end();
              return res.status(500).json({ error: 'Lỗi khi thêm người dùng' });
            }

            db.end();
            res.json({ message: 'Người dùng đã đăng ký thành công.' });
          });
        });
      });
    });
  });
});

app.listen(port, () => {
  console.log(`Server đang lắng nghe tại http://localhost:${port}`);
});
