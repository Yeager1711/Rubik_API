const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
const crypto = require('crypto');
const router = express.Router();

// Xử lý router
module.exports = router;

const app = express();
const port = 3001;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

const db = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'rubik',
});

db.connect((err) => {
  if (err) {
    console.error('Lỗi kết nối đến cơ sở dữ liệu MySQL: ' + err.stack);
    return;
  }
  console.log('Kết nối thành công đến cơ sở dữ liệu MySQL');
});

app.get('/', (req, res) => {
  res.send('Welcome to Login API');
});

app.post('/api/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  const query = 'SELECT user_id, full_name, phone_number, address, email, dateOfBirth, gender, role_id, password, avatar, username FROM user WHERE username = ?';

  db.query(query, [username], (error, results) => {
    if (error) {
      res.status(500).send('Lỗi trong quá trình truy vấn cơ sở dữ liệu.');
    } else {
      if (results.length > 0) {
        const user = results[0];

        // Băm mật khẩu người dùng nhập
        const hashedPassword = crypto.createHash('md5').update(password).digest('hex');

        // So sánh mật khẩu đã băm với mật khẩu trong cơ sở dữ liệu
        if (hashedPassword === user.password) {
          // Mật khẩu đúng
          delete user.password;

          const userData = {
            user_id: user.user_id,
            full_name: user.full_name,
            username: user.username,
            phone_number: user.phone_number,
            address: user.address,
            email: user.email,
            dateOfBirth: user.dateOfBirth,
            gender: user.gender,
            role_id: user.role_id,
            avatar: user.avatar,
          };

          res.status(200).json(userData);
        } else {
          res.status(401).send('Tên đăng nhập hoặc mật khẩu không chính xác.');
        }
      } else {
        res.status(401).send('Tên đăng nhập hoặc mật khẩu không chính xác.');
      }
    }
  });
});



app.listen(port, () => {
  console.log(`Server đang lắng nghe trên cổng ${port}`);
});
