import { Schema, model } from 'mongoose';

const orderSchema = new Schema({
  userId: { type: String, required: true }, // 关联用户 ID
  items: [{ 
    productId: String, 
    quantity: Number,
    price: Number
  }], // 订单项
  total: { type: Number, required: true }, // 订单总金额
  status: { type: String, default: 'pending' }, // 订单状态
  createdAt: { type: Date, default: Date.now }, // 创建时间
  updatedAt: { type: Date, default: Date.now }, // 更新时间
});

const Order = model('Order', orderSchema);

export default Order; 