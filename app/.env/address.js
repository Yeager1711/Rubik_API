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
});

//endpoint get address with user_id
app.get('/api/address/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const queryDataAddress = `
            SELECT * FROM address WHERE user_id = ?
        `;

        db.query(queryDataAddress, [userId], (error, results) => {
            if (error) {
                console.log('Lỗi truy suất dữ liệu địa chỉ người dùng !' + error);
                return res.status(500).json({ error: 'Lỗi truy suất dữ liệu địa chỉ người dùng !' });
            } else {
                if (results && results.length > 0) {
                    res.status(200).json(results);
                } else {
                    res.status(200).json({ message: 'Không có địa chỉ nào được tìm thấy cho user_id này !' })
                }
            }
        });
    } catch (error) {
        console.error('Lỗi khi truy suất dữ liệu địa chỉ người dùng:', error);
        res.status(500).json({ error: 'Lỗi khi truy suất dữ liệu địa chỉ người dùng.' });
    }
});


//endpoint add  new address
app.post('/api/address', (req, res) => {
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

//endpoint API update default_address_id
app.post('/api/user/set-default-address/:user_id', (req, res) => {
    const { user_id } = req.params;
    const { default_address_id } = req.body;

    // Chuẩn bị câu lệnh SQL INSERT
    const sql = `INSERT INTO user (user_id, default_address_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE default_address_id = ?`;

    // Thực hiện truy vấn
    connection.query(sql, [user_id, default_address_id, default_address_id], (error, results) => {
        if (error) {
            console.error('Lỗi khi thực hiện truy vấn:', error);
            return res.status(500).json({ message: 'Có lỗi khi cập nhật địa chỉ mặc định' });
        }

        return res.status(200).json({ message: 'Cập nhật địa chỉ mặc định thành công' });
    });
});


app.listen(port, () => {
    console.log(`Server is running on port Address: ${port}`);
});
