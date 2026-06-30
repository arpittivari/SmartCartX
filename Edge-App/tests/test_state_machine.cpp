#include <gtest/gtest.h>
#include "../src/controllers/StateManager.h"
#include <QSignalSpy>

TEST(StateManagerTest, InitialStateIsBoot) {
    StateManager sm;
    EXPECT_EQ(sm.currentState(), AppState::BOOT);
}

TEST(StateManagerTest, FlowThroughShoppingSession) {
    StateManager sm;
    
    // Simulate AppContext startup with config
    sm.checkDeviceConfiguration();
    EXPECT_EQ(sm.currentState(), AppState::CHECK_DEVICE_CONFIGURATION);

    // Assuming Config is loaded
    sm.handleConfigLoaded();
    EXPECT_EQ(sm.currentState(), AppState::CUSTOMER_ONBOARDING);

    // Scan customer
    sm.handleCustomerEntered();
    EXPECT_EQ(sm.currentState(), AppState::ACTIVE_SHOPPING);
    
    // Checkout
    sm.handleCheckoutRequested();
    EXPECT_EQ(sm.currentState(), AppState::CHECKOUT_PENDING);

    // Complete Payment
    sm.handlePaymentCompleted();
    EXPECT_EQ(sm.currentState(), AppState::PAYMENT_COMPLETE);

    // Reset for next customer
    sm.handleSessionReset();
    EXPECT_EQ(sm.currentState(), AppState::CUSTOMER_ONBOARDING);
}
