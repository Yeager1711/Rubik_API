const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = 4000;

module.exports = router;

app.use(express.json());
app.use(cors());

const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'rubik'
});

// Kiểm tra kết nối trước khi thực hiện bất kỳ truy vấn nào
db.connect(error => {
    if (error) {
        console.log('Lỗi kết nối với cơ sở dữ liệu', error.message);
    } else {
        console.log('Đã kết nối cơ sở dữ liệu thành công !');
    }
});

// Sử dụng Promise để thực hiện truy vấn
const executeQuery = (query, values) => {
    return new Promise((resolve, reject) => {
        db.query(query, values, (error, results) => {
            if (error) {
                console.error('Lỗi từ executeQuery:', error);
                console.error('Giá trị values:', values);
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
};

// Tạo Order_Id và OrderDetail_Id duy nhất theo thời gian và số ngẫu nhiê
const generateUniqueId = () => {
    const timestamp = new Date().getTime(); // Thời gian hiện tại
    const random = Math.floor(Math.random() * 1000); // Số ngẫu nhiên từ 0 đến 999
    return `${timestamp}${random}`;
};

// Cập nhật total_amount trong orders
const updateTotalAmount = async (orderId) => {
    const updateTotalItemAmountQuery = `
        UPDATE orders
        SET total_item_amount = (
            SELECT SUM(quantity)
            FROM orderdetails
            WHERE order_id = ?
        )
        WHERE Order_Id = ?;
    `;

    const updateTotalAmountQuery = `
            Update orders
            SET total_amount = (
                SELECT SUM(amount)
                FROM orderdetails
                WHERE order_id = ?
            )
            WHERE Order_Id = ?;
    `;

    await executeQuery(updateTotalItemAmountQuery, [orderId, orderId]);
    await executeQuery(updateTotalAmountQuery, [orderId, orderId]);
};

app.get('/api/carts', async (req, res) => {
    try {
        const queryData = `
            SELECT o.*, od.*
            From orders o
            LEFT JOIN orderdetails od ON o.Order_Id = od.order_id
        `;
        const results = await executeQuery(queryData);

        if (results && results.length > 0) {
            res.status(200).json(results);
        } else {
            res.status(200).json({ message: 'Không có dữ liệu !' });
        }
    } catch (error) {
        console.log('Lỗi truy suất dữ liệu', error);
        res.status(500).json({ error: 'Lỗi truy suất dữ liệu' });
    }
});


app.post('/api/addToCart', async (req, res) => {
    try {
        const { userId, productId, quantity, totalPrice } = req.body;
        console.log("Data input:" + userId, productId, quantity, totalPrice)

        // Kiểm tra xem người dùng đã có đơn hàng "incart" hay chưa
        const existingOrderQuery = `
            SELECT * FROM orders
            WHERE user_id = ? AND orderType = 'cart' AND order_status = 'incart'
        `;

        const existingOrder = await executeQuery(existingOrderQuery, [userId]);

        let orderId;

        if (existingOrder.length > 0) {
            // Nếu có đơn hàng, sử dụng Order_Id của đơn hàng hiện tại
            orderId = existingOrder[0].Order_Id;

            // Kiểm tra xem product_id đã tồn tại trong orderDetails hay chưa
            const existingOrderDetailQuery = `
                SELECT * FROM orderdetails
                WHERE order_id = ? AND product_id = ?
            `;

            const existingOrderDetail = await executeQuery(existingOrderDetailQuery, [orderId, productId]);

            if (existingOrderDetail.length > 0) {
                // Nếu product_id đã tồn tại, cộng dồn quantity và amount
                const updateOrderDetailQuery = `
                    UPDATE orderdetails
                    SET quantity = quantity + ?, amount = amount + ?
                    WHERE order_id = ? AND product_id = ?
                `;

                await executeQuery(updateOrderDetailQuery, [quantity, totalPrice, orderId, productId]);
            } else {
                // Nếu product_id chưa tồn tại, thêm mới orderDetail
                const orderDetailQuery = `
                    INSERT INTO orderdetails (orderDetail_id, quantity, amount, order_id, product_id)
                    VALUES (?, ?, ?, ?, ?)
                `;

                await executeQuery(orderDetailQuery, [generateUniqueId(), quantity, totalPrice, orderId, productId]);
            }
        } else {
            // Nếu không có đơn hàng, tạo đơn hàng mới và sử dụng Order_Id mới
            orderId = generateUniqueId();

            const orderQuery = `
                INSERT INTO orders (Order_Id, orderType, order_status, total_item_amount, total_discount, sub_total, total_tax, total_amount, user_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            await executeQuery(orderQuery, [orderId, 'cart', 'incart', 0, 0, 0, 0, 0, userId]);

            // Thêm mới orderDetail
            const orderDetailQuery = `
                INSERT INTO orderdetails (orderDetail_id, quantity, amount, order_id, product_id)
                VALUES (?, ?, ?, ?, ?)
            `;

            await executeQuery(orderDetailQuery, [generateUniqueId(), quantity, totalPrice, orderId, productId]);
        }

        // Cập nhật total_amount trong orders sau khi thêm mới hoặc cập nhật orderdetails
        await updateTotalAmount(orderId);

        res.status(200).json({ success: true, message: 'Sản phẩm được thêm vào giỏ hàng và đơn hàng đã được lưu thành công.' });
    } catch (error) {
        console.error('Lỗi khi xử lý yêu cầu:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi xử lý yêu cầu.' });
    }
});

//Get Order user_id
app.get('/api/carts/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const queryCart = `
        SELECT o.*, od.*
            FROM orders o
        LEFT JOIN orderdetails od ON o.Order_Id = od.order_id
        WHERE o.user_id = ? AND o.orderType = 'cart' AND o.order_status = 'incart'
        `;

        const cartItems = await executeQuery(queryCart, [userId]);

        if (cartItems && cartItems.length > 0) {
            res.status(200).json(cartItems);
        } else {
            res.status(200).json({ message: 'Không có đơn hàng nào cho user_id này.' });
        }
    } catch (error) {
        console.error('Lỗi khi truy suất dữ liệu đơn hàng:', error);
        res.status(500).json({ error: 'Lỗi khi truy suất dữ liệu đơn hàng.' });
    }
});

// Thêm endpoint để đặt hàng
// Thêm endpoint để đặt hàng
app.post('/api/placeOrder/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const totalAmountWithShipping = req.body.totalAmountWithShipping;
        const shippingTax = req.body.shippingTax;

        // Lấy đơn hàng hiện tại của người dùng
        const existingOrderQuery = `
            SELECT * FROM orders
            WHERE user_id = ? AND orderType = 'cart' AND order_status = 'incart'
        `;
        const existingOrder = await executeQuery(existingOrderQuery, [userId]);

        if (existingOrder.length > 0) {
            const orderId = existingOrder[0].Order_Id;

            // Trừ phí vận chuyển từ tổng số trước khi cập nhật
            const updateOrderQuery = `
                UPDATE orders
                SET orderType = 'order', order_status = 'ordered', shipping_tax = ?, total_amount = (? - ?), date_ordered = NOW()
                WHERE Order_Id = ?
            `;
            await executeQuery(updateOrderQuery, [shippingTax, totalAmountWithShipping, shippingTax, orderId]);

            res.status(200).json({ success: true, message: 'Đơn hàng đã được đặt thành công.' });
        } else {
            res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng để đặt.' });
        }
    } catch (error) {
        console.error('Lỗi khi đặt hàng:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi đặt hàng.' });
    }
});

// Thêm một endpoint API mới để xử lý việc xóa sản phẩm
app.post('/api/removeItemFromCart', async (req, res) => {
    try {
        const { orderId, productId } = req.body;

        // Triển khai logic để xóa sản phẩm khỏi giỏ hàng (orderdetails)
        const removeItemQuery = `
          DELETE FROM orderdetails
          WHERE order_id = ? AND product_id = ?
      `;

        await executeQuery(removeItemQuery, [orderId, productId]);

        // Cập nhật total_amount trong orders sau khi xóa sản phẩm
        await updateTotalAmount(orderId);

        res.status(200).json({ success: true, message: 'Sản phẩm đã được xóa khỏi giỏ hàng.' });
    } catch (error) {
        console.error('Lỗi khi xóa sản phẩm:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi xóa sản phẩm.' });
    }
});

//update quantity 
app.post('/api/updateOrderDetails', async (req, res) => {
    try {
        const { orderId, productId, newQuantity, newAmount } = req.body;

        // Cập nhật số lượng và amount trong orderdetails
        const updateQuantityQuery = `
        UPDATE orderdetails
        SET quantity = ?, amount = ?
        WHERE order_id = ? AND product_id = ?;
      `;

        await executeQuery(updateQuantityQuery, [newQuantity, newAmount, orderId, productId]);

        // Cập nhật total_amount trong orders sau khi cập nhật số lượng và amount
        await updateTotalAmount(orderId);

        res.status(200).json({ success: true, message: 'Số lượng và giá sản phẩm đã được cập nhật thành công!' });
    } catch (error) {
        console.error('Lỗi khi cập nhật số lượng và giá sản phẩm trong bảng orderdetails:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi cập nhật số lượng và giá sản phẩm.' });
    }
});



app.listen(port, () => {
    console.log(`Server is running on port Orders: ${port}`);
});
