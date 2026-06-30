import Transaction from '../models/transaction.model.js';
import Cart from '../models/cart.model.js';
import User from '../models/user.model.js';

/**
 * @desc    Get analytics summary for an admin's mall OR company's malls
 * @route   GET /api/analytics/summary
 * @access  Private
 */
export const getAnalyticsSummary = async (req, res) => {
  try {
    let matchQuery = {};

    if (req.user.role === 'company') {
        // Find all malls owned by this company
        const malls = await User.find({ parentCompanyId: req.user._id });
        const mallIds = malls.map(m => m.mallId);
        matchQuery = { mallId: { $in: mallIds } };
    } else {
        // Standard Mall Admin
        const mallId = req.user.mallId;
        if (!mallId) {
            return res.status(403).json({ message: 'User is not a valid admin.' });
        }
        matchQuery = { mallId: mallId };
    }

    // 2. Get Transaction Data (Total Revenue & Count)
    const transactionData = await Transaction.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalTransactions: { $sum: 1 },
        },
      },
    ]);

    // 3. Get Cart Fleet Data (Total Carts)
    const totalCarts = await Cart.countDocuments(matchQuery);

    // 4. Get Revenue Over Time (for our new line chart)
    const revenueOverTime = await Transaction.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          dailyRevenue: { $sum: '$totalAmount' },
        },
      },
      { $sort: { _id: 1 } }, // Sort by date
      { $limit: 30 } // Get the last 30 days
    ]);

    // 5. Get Top Categories (for our new pie chart)
    const topCategories = await Transaction.aggregate([
      { $match: matchQuery },
      { $unwind: '$items' }, // Deconstruct the items array
      {
        $group: {
          _id: '$items.category',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // 6. Format and send the response
    res.json({
      // For the widgets
      totalRevenue: transactionData[0]?.totalRevenue || 0,
      totalTransactions: transactionData[0]?.totalTransactions || 0,
      totalCarts: totalCarts,
      
      // For the charts
      revenueData: revenueOverTime.map(d => ({ 
        name: d._id, 
        Revenue: d.dailyRevenue / 100 // Convert from paise
      })),
      categoryData: topCategories.map(c => ({ 
        name: c._id || 'Uncategorized', 
        value: c.count 
      })),
    });

  } catch (error) {
    console.error('Error fetching analytics summary:', error);
    res.status(500).json({ message: 'Server error' });
  }
};