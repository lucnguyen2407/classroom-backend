const { db } = require('../firebase');
const authMiddleware = (req, res, next) => {
    const phoneNumber = req.headers['phone'];  // Giả sử bạn sẽ gửi phoneNumber qua headers (hoặc có thể dùng token)
    const role = req.headers['role'];  // Giả sử bạn cũng gửi role qua headers

    console.log('Auth Middleware:', { phoneNumber, role });


    if (!phoneNumber || !role) {
        return res.status(401).json({ error: 'Unauthorized: Missing phone number or role' });
    }

    // Kiểm tra nếu user trong Firestore có tồn tại và role hợp lệ
    db.collection('users').doc(phoneNumber).get()
        .then((doc) => {
            if (!doc.exists || doc.data().role !== role) {
                return res.status(403).json({ error: 'Forbidden: Invalid role' });
            }
            next();  // Nếu hợp lệ, tiếp tục xử lý request
        })
        .catch((err) => {
            res.status(500).json({ error: 'Server error' });
        });
};

module.exports = authMiddleware;
