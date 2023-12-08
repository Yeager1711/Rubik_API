const express = require('express');
const loginRouter = require('./login');
const registerRouter = require('./register');
const profileRouter = require('./profile');
const productRouter = require('./products');
const addCategoriesRouter = require('./addcategory');
const userRouter = require('./user');
const cartsRoutter = require('./cart')
const addressRouter = require('./address');
const dotenv = require('dotenv');

dotenv.config(); // Tải biến môi trường từ file .env

const app = express();
const port = process.env.PORT || 3000; // Sử dụng biến môi trường hoặc giá trị mặc định

// Sử dụng router như một middleware
app.use('/login', loginRouter);
app.use('/register', registerRouter);
app.use('/profile', profileRouter);
app.use('/products', productRouter);
app.use('/addcategory', addCategoriesRouter);
app.use('/user', userRouter);
app.use('/address', addressRouter)

app.use('/cart', cartsRoutter);

// Lắng nghe trên cổng đã được đặt trong biến môi trường
app.listen(port, () => {
  console.log(`Server is running on port index: ${port}`);
});
