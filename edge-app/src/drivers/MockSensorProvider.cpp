#include "MockSensorProvider.h"
#include <QDebug>

MockSensorProvider::MockSensorProvider(TelemetryService* telemetry, ShoppingService* shopping, QObject* parent)
    : QObject(parent), m_telemetry(telemetry), m_shopping(shopping), m_mockBattery(100.0f)
{
    m_timer = new QTimer(this);
    m_timer->setInterval(5000); // Mock tick every 5 seconds
    connect(m_timer, &QTimer::timeout, this, &MockSensorProvider::onTick);
}

void MockSensorProvider::startMocking() {
    qDebug() << "[MockSensorProvider] Started providing mock data.";
    m_timer->start();
}

void MockSensorProvider::stopMocking() {
    m_timer->stop();
}

void MockSensorProvider::onTick() {
    // 1. Mock Battery Telemetry
    m_mockBattery -= 0.1f;
    if (m_mockBattery < 0.0f) m_mockBattery = 100.0f;
    if (m_telemetry) {
        m_telemetry->updateBattery(m_mockBattery);
        m_telemetry->publishHeartbeat();
    }
    
    // 2. Mock Weight Event occasionally if we're in shopping session
    if (m_shopping && m_shopping->currentSession().isActive()) {
        static int weightMockCounter = 0;
        weightMockCounter++;
        if (weightMockCounter % 3 == 0) { // Every 15 seconds roughly
            qDebug() << "[MockSensorProvider] Sending mock weight event.";
            m_shopping->processWeightEvent(250);
        }
    }
}