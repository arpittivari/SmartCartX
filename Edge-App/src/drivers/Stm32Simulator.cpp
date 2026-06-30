#include "Stm32Simulator.h"
#include <QDebug>
#include "../../../protocols/include/packet.hpp"

Stm32Simulator::Stm32Simulator(SerialService* serialService, QObject* parent)
    : QObject(parent), m_serialService(serialService), m_uptime(0), m_mockBatteryPct(100)
{
    m_heartbeatTimer = new QTimer(this);
    m_heartbeatTimer->setInterval(5000);
    connect(m_heartbeatTimer, &QTimer::timeout, this, &Stm32Simulator::onHeartbeatTick);

    m_batteryTimer = new QTimer(this);
    m_batteryTimer->setInterval(60000);
    connect(m_batteryTimer, &QTimer::timeout, this, &Stm32Simulator::onBatteryTick);

    m_weightTimer = new QTimer(this);
    m_weightTimer->setInterval(15000);
    connect(m_weightTimer, &QTimer::timeout, this, &Stm32Simulator::onWeightTick);
    
    m_buttonTimer = new QTimer(this);
    m_buttonTimer->setInterval(45000);
    connect(m_buttonTimer, &QTimer::timeout, this, &Stm32Simulator::onButtonTick);
    
    m_diagnosticTimer = new QTimer(this);
    m_diagnosticTimer->setInterval(120000);
    connect(m_diagnosticTimer, &QTimer::timeout, this, &Stm32Simulator::onDiagnosticTick);
}

void Stm32Simulator::startMocking() {
    qDebug() << "[Stm32Simulator] Started UART generation.";
    m_heartbeatTimer->start();
    m_batteryTimer->start();
    m_weightTimer->start();
    m_buttonTimer->start();
    m_diagnosticTimer->start();
}

void Stm32Simulator::stopMocking() {
    m_heartbeatTimer->stop();
    m_batteryTimer->stop();
    m_weightTimer->stop();
    m_buttonTimer->stop();
    m_diagnosticTimer->stop();
}

void Stm32Simulator::onHeartbeatTick() {
    m_uptime += 5000;
    
    SmartCart::Protocol::HeartbeatPayload hb;
    hb.uptime_ms = m_uptime;
    
    uint8_t tx_buffer[256];
    size_t len = SmartCart::Protocol::PacketBuilder::build(
        SmartCart::Protocol::Command::CMD_HEARTBEAT, 
        reinterpret_cast<const uint8_t*>(&hb), 
        sizeof(hb), 
        tx_buffer, 
        sizeof(tx_buffer)
    );
    
    QByteArray data(reinterpret_cast<const char*>(tx_buffer), static_cast<int>(len));
    if (m_serialService) {
        m_serialService->simulateRx(data);
    }
}

void Stm32Simulator::onButtonTick() {
    SmartCart::Protocol::ButtonPayload btn;
    btn.button_id = 1;
    btn.event_type = 1; // Pressed
    
    uint8_t tx_buffer[256];
    size_t len = SmartCart::Protocol::PacketBuilder::build(
        SmartCart::Protocol::Command::CMD_BUTTON_EVENT, 
        reinterpret_cast<const uint8_t*>(&btn), 
        sizeof(btn), 
        tx_buffer, 
        sizeof(tx_buffer)
    );
    
    QByteArray data(reinterpret_cast<const char*>(tx_buffer), static_cast<int>(len));
    if (m_serialService) {
        qDebug() << "[Stm32Simulator] Sending mock button event.";
        m_serialService->simulateRx(data);
    }
}

void Stm32Simulator::onDiagnosticTick() {
    SmartCart::Protocol::DiagnosticPayload diag;
    diag.error_code = 0;
    strncpy(diag.message, "ALL_OK", sizeof(diag.message)-1);
    diag.message[sizeof(diag.message)-1] = '\0';
    
    uint8_t tx_buffer[256];
    size_t len = SmartCart::Protocol::PacketBuilder::build(
        SmartCart::Protocol::Command::CMD_DIAGNOSTIC, 
        reinterpret_cast<const uint8_t*>(&diag), 
        sizeof(diag), 
        tx_buffer, 
        sizeof(tx_buffer)
    );
    
    QByteArray data(reinterpret_cast<const char*>(tx_buffer), static_cast<int>(len));
    if (m_serialService) {
        qDebug() << "[Stm32Simulator] Sending mock diagnostic event.";
        m_serialService->simulateRx(data);
    }
}

void Stm32Simulator::onBatteryTick() {
    if (m_mockBatteryPct > 5) {
        m_mockBatteryPct -= 1;
    } else {
        m_mockBatteryPct = 100;
    }
    
    SmartCart::Protocol::BatteryPayload b;
    b.voltage_mv = 12000;
    b.state_of_charge_pct = m_mockBatteryPct;
    b.is_charging = 0;
    
    uint8_t tx_buffer[256];
    size_t len = SmartCart::Protocol::PacketBuilder::build(
        SmartCart::Protocol::Command::CMD_BATTERY_TELEMETRY, 
        reinterpret_cast<const uint8_t*>(&b), 
        sizeof(b), 
        tx_buffer, 
        sizeof(tx_buffer)
    );
    
    QByteArray data(reinterpret_cast<const char*>(tx_buffer), static_cast<int>(len));
    if (m_serialService) {
        m_serialService->simulateRx(data);
    }
}

void Stm32Simulator::onWeightTick() {
    SmartCart::Protocol::WeightPayload w;
    w.weight_grams = 250;
    
    uint8_t tx_buffer[256];
    size_t len = SmartCart::Protocol::PacketBuilder::build(
        SmartCart::Protocol::Command::CMD_WEIGHT_TELEMETRY, 
        reinterpret_cast<const uint8_t*>(&w), 
        sizeof(w), 
        tx_buffer, 
        sizeof(tx_buffer)
    );
    
    QByteArray data(reinterpret_cast<const char*>(tx_buffer), static_cast<int>(len));
    if (m_serialService) {
        qDebug() << "[Stm32Simulator] Sending mock weight event.";
        m_serialService->simulateRx(data);
    }
}