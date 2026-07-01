#include <gtest/gtest.h>
#include "../src/models/ShoppingSession.h"
#include "../src/models/CustomerProfile.h"

TEST(ShoppingSessionTest, InitialStateIsInactive) {
    ShoppingSession session;
    EXPECT_FALSE(session.isActive());
    EXPECT_TRUE(session.sessionId().isEmpty());
    EXPECT_FALSE(session.customer().isValid());
}

TEST(ShoppingSessionTest, StartSetsActiveAndCustomer) {
    ShoppingSession session;
    CustomerProfile customer("cust123", "user@example.com");

    session.start(customer);

    EXPECT_TRUE(session.isActive());
    EXPECT_FALSE(session.sessionId().isEmpty());
    EXPECT_EQ(session.customer().id(), "cust123");
    EXPECT_EQ(session.customer().identifier(), "user@example.com");
    EXPECT_TRUE(session.customer().isValid());
}

TEST(ShoppingSessionTest, EndSetsInactive) {
    ShoppingSession session;
    CustomerProfile customer("cust123", "user@example.com");

    session.start(customer);
    EXPECT_TRUE(session.isActive());

    session.end();

    EXPECT_FALSE(session.isActive());
    // session ID and customer should remain accessible even after ending
    EXPECT_FALSE(session.sessionId().isEmpty());
    EXPECT_EQ(session.customer().id(), "cust123");
}
