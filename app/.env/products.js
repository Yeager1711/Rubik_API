const express = require('express');
const mysql = require('mysql');
const fs = require('fs');
const cors = require('cors');;
const multer = require('multer');
const { error } = require('console');
const router = express.Router();
const app = express();
const port = 3005;

module.exports = router;


app.use(express.json());
app.use(cors());

const db = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'rubik',
});

db.connect(error => {
  if (error) {
    console.log('Lỗi khi kết nối cơ sở dữ liệu: ' + error.message);
  } else {
    console.log('Đã kết nối thành công cơ sở dữ liệu');
  }
});

app.get('/api/products', (req, res) => {
  const queryData = 'SELECT * FROM product';

  db.query(queryData, (error, results) => {
    if (error) {
      console.log('Lỗi truy suất dữ liệu !' + error)
      return res.status(500).json({ error: 'Lỗi truy suất dữ liệu !' });
    } else {
      if (results && results.length > 0) {
        res.status(200).json(results);
      } else {
        results.status(200).json({ message: 'Không có dữ liệu !' });
      }
    }
  })
});


function encodeImageToBase64(imagePath) {
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    return imageBuffer.toString('base64');
  } catch (error) {
    console.log('Lỗi khi mã hóa ảnh:' + error);
    throw error;
  }
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },

  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

app.post('/api/addproduct', upload.single('image_product'), (req, res) => {
  console.log('Bắt đầu xử lý POST request');

  const formData = req.body;
  console.log('Dữ liệu gửi từ client:', formData);

  const image_product = req.file;
  console.log('File ảnh:', image_product);

  // Lấy dữ liệu từ req.body
  const name_product = formData.name_product;
  console.log('Tên sản phẩm:', name_product);

  const price = formData.price;
  console.log('Giá sản phẩm:', price);

  const total_product = formData.total_product;
  console.log('Số lượng sản phẩm:', total_product);

  const description = formData.description;
  console.log('Mô tả sản phẩm:', description);

  const category_id = formData.category_id;
  console.log('ID loại sản phẩm:', category_id);

  // Kiểm tra valid
  if (!name_product || !price || !total_product || !description || !image_product || category_id === "") {
    console.log('Dữ liệu không hợp lệ, lỗi xảy ra.');
    return res.status(400).json({ error: "Vui lòng nhập đầy đủ các thông tin sản phẩm, bao gồm loại sản phẩm." });
  }

  // Mã hóa ảnh thành chuỗi base64
  const image_base64 = encodeImageToBase64(image_product.path);
  console.log('Ảnh được mã hóa thành chuỗi base64:', image_base64);

  const query = 'INSERT INTO product (name_product, price, total_product, description, image_product, category_id) VALUES (?, ?, ?, ?, ?, ?)';
  const insertValues = [name_product, price, total_product, description, image_base64, category_id];

  db.query(query, insertValues, (err, result) => {
    if (err) {
      console.error('Lỗi trong quá trình thêm sản phẩm vào cơ sở dữ liệu: ' + err);
      return res.status(500).json({ error: "Lỗi khi thêm sản phẩm vào cơ sở dữ liệu" });
    } else {
      console.log('Sản phẩm đã được thêm thành công.');
      return res.status(201).json({ message: "Sản phẩm được thêm thành công." });
    }
  });
});


// DELETE
app.delete('/api/products/:id', (req, res) => {
  const productId = req.params.id

  const queryDelete = 'DELETE FROM product WHERE Product_Id = ?';

  db.query(queryDelete, [productId], (err, result) => {
    if (err) {
      console.error('Lỗi trong quá trình xóa sản phẩm từ Cơ Sở Dữ Liệu' + err)
      return res.status(500).json({ error: "Lỗi khi xóa sản phẩm từ cơ sở dữ liệu" });
    } else {
      console.log('Sản phẩm đã được xóa thành công.');
      return res.status(200).json({ message: "Sản phẩm đã được xóa thành công." });
    }
  })
})

//GET BY ID Product
app.get('/api/products/:id?', (req, res) => {
  const productId = req.params.id;
  let queryData;

  if (productId) {
    queryData = 'SELECT * FROM product WHERE Product_Id = ?';
  } else {
    queryData = 'SELECT * FROM product'
  }

  db.query(queryData, [productId], (error, results) => {
    if (error) {
      console.log('Lỗi truy suất dữ liệu', error);
      return res.status(500).json({ error: 'Lỗi truy suất dữ liệu !' });
    } else {
      if (results && results.length > 0) {
        if (productId) {
          const product = results[0];
          res.status(200).json(product);
        } else {
          res.status(200).json(product);
        }
      } else {
        if (productId) {
          res.status(400).json({ message: 'Không tìm thấy sản phẩm !' });
        } else {
          res.status(200).json({ message: 'Không có dữ liệu !' });
        }
      }
    }
  });
});


//Edit Product
// UPDATE
// Trong mã API Express của bạn
app.put('/api/products/:id', upload.single('image_product'), (req, res) => {
  const productId = req.params.id;
  const formData = req.body;
  const image_product = req.file;

  const name_product = formData.name_product;
  const price = formData.price;
  const total_product = formData.total_product;
  const description = formData.description;
  const category_id = formData.category_id;

  // Kiểm tra valid
  if (!name_product || !price || !total_product || !description || !category_id) {
      return res.status(400).json({ error: "Vui lòng nhập đầy đủ các thông tin sản phẩm, bao gồm loại sản phẩm." });
  }

  let updateValues = [name_product, price, total_product, description, category_id];
  let updateQuery = 'UPDATE product SET name_product = ?, price = ?, total_product = ?, description = ?, category_id = ?';

  // Nếu có ảnh được tải lên
  if (image_product) {
      // Kiểm tra xem có lỗi khi mã hóa ảnh không
      try {
          const image_base64 = encodeImageToBase64(image_product.path);
          updateValues.push(image_base64);
          updateQuery += ', image_product = ?';
      } catch (error) {
          return res.status(500).json({ error: "Lỗi khi mã hóa ảnh." });
      }
  }

  updateQuery += ' WHERE Product_Id = ?';
  updateValues.push(productId);

  db.query(updateQuery, updateValues, (err, result) => {
      if (err) {
          console.error('Lỗi trong quá trình cập nhật sản phẩm trong cơ sở dữ liệu: ' + err);
          return res.status(500).json({ error: "Lỗi khi cập nhật sản phẩm trong cơ sở dữ liệu" });
      } else {
          console.log('Sản phẩm đã được cập nhật thành công.');
          return res.status(200).json({ message: "Sản phẩm đã được cập nhật thành công." });
      }
  });
});



app.listen(port, () => {
  console.log(`Server is running on port Products: ${port}`);
});
