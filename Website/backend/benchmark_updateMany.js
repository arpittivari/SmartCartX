import mongoose from 'mongoose';
import Cart from './src/models/cart.model.js';

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

  // Optimize: Use updateMany
  const filter = {
    lastSeen: { $lt: cutoffTime },
    status: { $ne: 'Offline' }
  };

  const staleCartsCount = await Cart.countDocuments(filter);

  if (staleCartsCount > 0) {
    const staleCarts = await Cart.find(filter, '_id');
    const staleCartIds = staleCarts.map(cart => cart._id);

    await Cart.updateMany(
      { _id: { $in: staleCartIds } },
      { $set: { status: 'Offline' } }
    );

    // Broadcast updates (we still need to broadcast to sockets, so we need the IDs to broadcast)
    for (const id of staleCartIds) {
      // Mock cart structure as needed by emit, or emit IDs, assuming we just need to emit that the cart updated.
      // If the frontend needs the whole cart, we might need to fetch them after update or broadcast just the IDs.
      const cartMock = { _id: id, status: 'Offline' };
      io.emit('cartUpdate', cartMock);
      io.to(id.toString()).emit('cartUpdate', cartMock);
    }
  }

  const end = performance.now();
  console.log(`Time taken with updateMany: ${end - start} ms`);

  await mongoose.disconnect();
}

runBenchmark().catch(console.error);
