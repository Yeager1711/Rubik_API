const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const router = express.Router();
const app = express();
const port = 3006;

module.exports = router;

app.use(express.json());
app.use(cors());

const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'rubik',
});

db.connect((err) => {
    if(err) {
        console.log('Lỗi khi kết nối Cơ Sở Dữ Liệu !');
    }else {
        console.log('Đã kết nối thành công Cơ Sở Dữ Liệu.');
    }
});

app.get('/api/category', (req, res) => {
    // res.send('Welcome to the API Add Category!');

    const queryData = 'SELECT * FROM category'

    db.query(queryData, (error, results) => {
        if(error) {
            console.log('Lỗi trong quá trình truy vấn dữ liệu' +error);
            return res.status(500).json({error: 'Lỗi trong quá trình truy vấn dữ liệu'})
        }else {
            if(results && results.length > 0) {
                res.status(200).json(results);
            }else {
                res.status(200).json({message: 'Không có dữ liệu nào !'});
            }
        }
    })
});


app.post('/api/category', (req, res) => {
    const formData = req.body;
    console.log(formData);
    const name = formData.name;

    if (!name) {
        return res.status(400).json({ error: "Vui lòng thêm tên loại sản phẩm!" });
    }

    const query = 'INSERT INTO category (name) VALUES (?)';
    const insertCategoryQuery = [name];

    db.query(query, insertCategoryQuery, (err, results) => {
        if (err) {
            console.log('Lỗi trong quá trình thêm loại sản phẩm: ' + err);
            return res.status(500).json({ error: "Lỗi trong quá trình thêm loại sản phẩm" });
        } else {
            return res.status(200).json({ message: "Thêm loại sản phẩm thành công" });
        }
    });
});

app.listen(port, () => {
    console.log(`Server is running on port Category: ${port}`);
});