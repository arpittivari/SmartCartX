#include "DebugController.h"

DebugController::DebugController(StateManager* state, SerialService* serial, MqttService* mqtt, QObject* parent)
    : QObject(parent), m_state(state), m_serial(serial), m_mqtt(mqtt), m_packetCount(0), m_uartConnected(false), m_mqttConnected(false)
{
    connect(m_serial, &SerialService::packetReceived, this, &DebugController::onPacketReceived);
    
    connect(m_serial, &SerialService::portOpened, this, [this]() {
        m_uartConnected = true;
        emit debugStatsChanged();
    });
    connect(m_serial, &SerialService::portClosed, this, [this]() {
        m_uartConnected = false;
        emit debugStatsChanged();
    });

    connect(m_mqtt, &MqttService::mqttConnected, this, [this]() {
        m_mqttConnected = true;
        emit debugStatsChanged();
    });
    connect(m_mqtt, &MqttService::disconnected, this, [this]() {
        m_mqttConnected = false;
        emit debugStatsChanged();
    });

    connect(m_state, &StateManager::stateChanged, this, &DebugController::debugStatsChanged);
}

QString DebugController::currentState() const {
    if (m_state) return m_state->currentStateName();
    return "UNKNOWN";
}

void DebugController::onPacketReceived(SmartCart::Protocol::Command cmd, const uint8_t* payload, uint8_t len) {
    m_packetCount++;
    switch(cmd) {
        case SmartCart::Protocol::Command::CMD_HEARTBEAT: m_lastPacketType = "HEARTBEAT"; break;
        case SmartCart::Protocol::Command::CMD_WEIGHT_TELEMETRY: m_lastPacketType = "WEIGHT"; break;
        case SmartCart::Protocol::Command::CMD_BATTERY_TELEMETRY: m_lastPacketType = "BATTERY"; break;
        default: m_lastPacketType = "OTHER"; break;
    }
    emit debugStatsChanged();
}