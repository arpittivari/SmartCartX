#include <gtest/gtest.h>
#include <QSignalSpy>
#include <QTimer>
#include "../src/drivers/simulated/SimulatedButtonInput.h"

class SimulatedButtonInputTest : public ::testing::Test {
protected:
    void SetUp() override {
        buttonInput = new SimulatedButtonInput();
        timer = buttonInput->findChild<QTimer*>();
    }

    void TearDown() override {
        delete buttonInput;
    }

    SimulatedButtonInput* buttonInput;
    QTimer* timer;
};

TEST_F(SimulatedButtonInputTest, TimerStartsOnMocking) {
    ASSERT_NE(timer, nullptr) << "Timer should be created internally.";
    EXPECT_FALSE(timer->isActive()) << "Timer should not be active initially.";

    buttonInput->startMocking();
    EXPECT_TRUE(timer->isActive()) << "Timer should be active after startMocking.";
}

TEST_F(SimulatedButtonInputTest, TimerStopsOnMockingStopped) {
    ASSERT_NE(timer, nullptr) << "Timer should be created internally.";
    buttonInput->startMocking();
    EXPECT_TRUE(timer->isActive());

    buttonInput->stopMocking();
    EXPECT_FALSE(timer->isActive()) << "Timer should not be active after stopMocking.";
}

TEST_F(SimulatedButtonInputTest, ButtonPressedSignalEmittedOnTimeout) {
    QSignalSpy spy(buttonInput, &SimulatedButtonInput::buttonPressed);
    ASSERT_TRUE(spy.isValid());

    // Call the private slot indirectly by invoking it using QMetaObject
    QMetaObject::invokeMethod(buttonInput, "onButtonTick");

    EXPECT_EQ(spy.count(), 1) << "buttonPressed signal should be emitted once on timeout.";

    QList<QVariant> arguments = spy.takeFirst();
    EXPECT_EQ(arguments.at(0).toInt(), 1) << "buttonPressed signal should emit 1.";
}
