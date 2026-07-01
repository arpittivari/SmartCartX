#include <gtest/gtest.h>

#include <QCoreApplication>
#include <QSignalSpy>
#include <QTimer>
#include <QObject>
#include "../src/drivers/simulated/SimulatedButtonInput.h"

// Note: QCoreApplication should ideally be initialized once in main(),
// but since GTest handles main in our setup, we can create a static global instance,
// or manage argc/argv statically so they don't go out of scope.

static int argc = 1;
static char* argv[] = { (char*)"test", nullptr };
static QCoreApplication* app = nullptr;

class SimulatedButtonInputTest : public ::testing::Test {
protected:
    static void SetUpTestSuite() {
        if (!QCoreApplication::instance()) {
            app = new QCoreApplication(argc, argv);
        }
    }

    static void TearDownTestSuite() {
        if (app) {
            delete app;
            app = nullptr;
        }
    }
};

TEST_F(SimulatedButtonInputTest, EmitsButtonPressedWhenMocking) {
    SimulatedButtonInput buttonInput;

    QTimer* timer = buttonInput.findChild<QTimer*>();
    ASSERT_NE(timer, nullptr) << "QTimer child should exist";

    EXPECT_FALSE(timer->isActive());

    buttonInput.startMocking();
    EXPECT_TRUE(timer->isActive());

    buttonInput.stopMocking();
    EXPECT_FALSE(timer->isActive());
}

TEST_F(SimulatedButtonInputTest, SignalEmittedOnTick) {
    SimulatedButtonInput buttonInput;
    QSignalSpy spy(&buttonInput, &SimulatedButtonInput::buttonPressed);

    QTimer* timer = buttonInput.findChild<QTimer*>();
    ASSERT_NE(timer, nullptr) << "QTimer child should exist";

    // Change interval to 1ms to trigger quickly
    timer->setInterval(1);
    buttonInput.startMocking();

    // Wait for the signal
    EXPECT_TRUE(spy.wait(100)); // wait up to 100ms
    EXPECT_GE(spy.count(), 1);

    QList<QVariant> arguments = spy.takeFirst();
    EXPECT_EQ(arguments.at(0).toInt(), 1) << "Should emit button 1 pressed";

    buttonInput.stopMocking();

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
