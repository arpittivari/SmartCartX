import mongoose from 'mongoose';
import Cart from './src/models/cart.model.js';
import connectMqttClient from './src/services/mqtt.service.js';

async function runBenchmark() {
  await mongoose.connect('mongodb://localhost:27017/benchmark_test');

  // Create 1000 stale carts
  await Cart.deleteMany({});
  const staleTime = new Date(Date.now() - 100000);

  const cartsToInsert = [];
  for (let i = 0; i < 1000; i++) {
    cartsToInsert.push({
      cartId: `cart_${i}`,
      mallId: `mall_1`,
      macAddress: `00:00:00:00:00:${i.toString(16).padStart(2, '0')}`,
      status: 'Idle',
      lastSeen: staleTime,
      createdBy: new mongoose.Types.ObjectId()
    });
  }
  await Cart.insertMany(cartsToInsert);

  console.log('Inserted 1000 stale carts');

  const STALE_TIMEOUT = 65 * 1000; // 65 seconds
  const cutoffTime = new Date(Date.now() - STALE_TIMEOUT);

  // Mock IO
  const io = {
    emit: () => {},
    to: () => ({ emit: () => {} })
  };

  const start = performance.now();

  const staleCarts = await Cart.find({
    lastSeen: { $lt: cutoffTime },
    status: { $ne: 'Offline' }
  });

  if (staleCarts.length > 0) {
    for (const cart of staleCarts) {
      cart.status = 'Offline';
      await cart.save();
      io.emit('cartUpdate', cart);
      io.to(cart._id.toString()).emit('cartUpdate', cart);
    }
  }

  const end = performance.now();
  console.log(`Time taken with individual saves: ${end - start} ms`);

  await mongoose.disconnect();
}

runBenchmark().catch(console.error);
