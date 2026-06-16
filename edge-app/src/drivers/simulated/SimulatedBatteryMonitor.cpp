#include "SimulatedBatteryMonitor.h"

SimulatedBatteryMonitor::SimulatedBatteryMonitor(QObject* parent) 
    : IBatteryMonitor(parent), m_mockBatteryPct(100.0f) 
{
    m_timer = new QTimer(this);
    m_timer->setInterval(60000);
    connect(m_timer, &QTimer::timeout, this, &SimulatedBatteryMonitor::onBatteryTick);
}

void SimulatedBatteryMonitor::startMocking() { m_timer->start(); }
void SimulatedBatteryMonitor::stopMocking() { m_timer->stop(); }

void SimulatedBatteryMonitor::onBatteryTick() {
    m_mockBatteryPct -= 1.0f;
    if (m_mockBatteryPct < 0.0f) m_mockBatteryPct = 100.0f;
    emit batteryLevelChanged(m_mockBatteryPct);
}