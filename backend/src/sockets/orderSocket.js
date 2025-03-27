module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('New client connected');

        // Handle new order event
        socket.on('new_order', (data) => {
            io.emit('new_order', data); // ส่งต่อข้อมูลคำสั่งซื้อใหม่ไปยังคลัสเตอร์ทั้งหมด
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected');
        });
    });
};