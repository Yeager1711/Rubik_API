const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
const router = express.Router();


const app = express();
const port = 3008;
module.exports = router;

app.use(express.json());
app.use(cors());

const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'rubik'
});

db.connect((error) => {
    if (error) {
        console.log('Lỗi khi kết nối với cơ sở dữ liệu !', error);
    } else {
        console.log('Đã kết nối cơ sở dữ liệu')
    }
});

app.get('/api/address', (req, res) => {
    const queryAddress = 'SELECT * FROM address'

    db.query(queryAddress, (error, results) => {
        if (error) {
            console.log('Lỗi truy suất dữ liệu !' + error)
            return res.status(500).json({ error: 'Lỗi truy suất dữ liệu !' });
        } else {
            if (results && results.length > 0) {
                res.status(200).json(results);
            } else {
                res.status(200).json({ message: 'Không có dữ liệu user address !' })
            }
        }
    });
})

router.post('/address', (req, res) => {
    const { name, user_id } = req.body;

    // Thêm dữ liệu vào cơ sở dữ liệu
    const query = `INSERT INTO address (name, user_id) VALUES (?, ?)`;
    db.query(query, [name, user_id], (error, results) => {
        if (error) {
            console.error('Lỗi khi thêm địa chỉ vào cơ sở dữ liệu:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.status(201).json({ message: 'Đã thêm địa chỉ thành công' });
        }
    });
});

module.exports = router;

app.listen(port, () => {
    console.log(`Server is running on port Orders: ${port}`);
});
