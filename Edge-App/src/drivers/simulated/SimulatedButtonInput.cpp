#include "SimulatedButtonInput.h"

SimulatedButtonInput::SimulatedButtonInput(QObject* parent) : IButtonInput(parent) {
    m_timer = new QTimer(this);
    m_timer->setInterval(45000);
    connect(m_timer, &QTimer::timeout, this, &SimulatedButtonInput::onButtonTick);
}

void SimulatedButtonInput::startMocking() { m_timer->start(); }
void SimulatedButtonInput::stopMocking() { m_timer->stop(); }

void SimulatedButtonInput::onButtonTick() {
    emit buttonPressed(1);
}