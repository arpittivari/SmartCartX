#include "SimulatedWeightSensor.h"

SimulatedWeightSensor::SimulatedWeightSensor(QObject* parent) : IWeightSensor(parent) {
    m_timer = new QTimer(this);
    m_timer->setInterval(15000);
    connect(m_timer, &QTimer::timeout, this, &SimulatedWeightSensor::onWeightTick);
}

void SimulatedWeightSensor::startMocking() { m_timer->start(); }
void SimulatedWeightSensor::stopMocking() { m_timer->stop(); }

void SimulatedWeightSensor::onWeightTick() {
    emit weightChanged(250); // Hardcoded mock weight
}