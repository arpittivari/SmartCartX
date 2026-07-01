#include <gtest/gtest.h>
#include "../src/models/ShoppingSession.h"
#include "../src/models/CustomerProfile.h"
#include <QDateTime>

TEST(ShoppingSessionTest, InitialStateIsInactive) {
    ShoppingSession session;
    EXPECT_FALSE(session.isActive());
    EXPECT_TRUE(session.sessionId().isEmpty());
    EXPECT_FALSE(session.customer().isValid());
}

TEST(ShoppingSessionTest, StartSessionSetsProperties) {
    ShoppingSession session;
    CustomerProfile customer("12345", "test@example.com");

    session.start(customer);

    EXPECT_TRUE(session.isActive());
    EXPECT_FALSE(session.sessionId().isEmpty());
    EXPECT_EQ(session.customer().id(), "12345");
    EXPECT_EQ(session.customer().identifier(), "test@example.com");
}

TEST(ShoppingSessionTest, EndSessionUpdatesActiveState) {
    ShoppingSession session;
    CustomerProfile customer("12345", "test@example.com");

    session.start(customer);
    EXPECT_TRUE(session.isActive());

    session.end();
    EXPECT_FALSE(session.isActive());
    // The session ID should remain after ending
    EXPECT_FALSE(session.sessionId().isEmpty());
}
