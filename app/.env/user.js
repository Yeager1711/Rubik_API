// const express = require('express');
// const mysql = require('mysql');
// const bodyParser = require('body-paser');
// const cors = require('cors');
// const router = express.Router();

// module.exports = router;


// const app = express();
// const port = 3007;


// app.use(express.json());
// app.use(cors());

// const db = mysql.createConnection({
//     host: '127.0.0.1',
//     user:'root',
//     password: '',
//     database: 'rubik',
// });

// db.connect((error) => {
//     if(errorr) {
//         console.log('Lỗi khi kết nối cơ sở dữ liệu !' + error.message);
//     }else {
//         console.log('Đã kết nối với cơ sở dữ liệu.')
//     }
// });

// app.get('/api/user', (req, res) => {
//     const queryData = 'SELECT * FROM user';

//     db.query(queryData, (error, results) => {
//         if(error) {
//             console.log('Lỗi truy suất dữ liệu !' + error)
//             return res.status(500).json({error: 'Lỗi truy suất dữ liệu !'});
//         }else {
//             if(results && results.length > 0) {
//                 res.status(200).json(results);
//             }else {
//                 results.status(200).json({message: 'Không có dữ liệu user !'})
//             }
//         }
//     });
// });


