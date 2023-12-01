const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');

module.exports = router;
const app = express();
const port = 3003;

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
        console.error('Lỗi khi kết nối đến Cơ Sở dữ liệu MySQL:' + err.stack);
        return;
    }
    console.log('Kết nối thành công đến Cơ Sở Dữ Liệu');
});

app.get('/', (req, res) => {
    res.send('Welcome to Profile API');
});

app.get('/api/users/:user_id', (req, res) => {

    const user_id = req.params.user_id;

    const query = 'SELECT * FROM user WHERE user_id = ?';
    db.query(query,[user_id], (err, results) => {
        if (err) {
            console.error('Lỗi khi truy vấn Cơ sở dữ liệu:' + err);
            res.status(500).json({ error: 'Lỗi khi truy vấn cơ sở dữ liệu' });
        } else if(results.length == 0){
            res.status(404).json({ error: 'Người dùng không tồn tại'});
        }else {
            res.status(200).json(results);
        }
    });
});

app.listen(port, () => {
    console.log(`Server đang lắng nghe trên cổng ${port}`);
});
