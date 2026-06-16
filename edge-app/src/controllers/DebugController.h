#ifndef DEBUG_CONTROLLER_H
#define DEBUG_CONTROLLER_H

#include <QObject>
#include <QString>
#include "../services/MqttService.h"
#include "../services/SerialService.h"
#include "StateManager.h"

class DebugController : public QObject {
    Q_OBJECT
    Q_PROPERTY(QString lastPacketType READ lastPacketType NOTIFY debugStatsChanged)
    Q_PROPERTY(int packetCount READ packetCount NOTIFY debugStatsChanged)
    Q_PROPERTY(bool uartConnected READ uartConnected NOTIFY debugStatsChanged)
    Q_PROPERTY(bool mqttConnected READ mqttConnected NOTIFY debugStatsChanged)
    Q_PROPERTY(QString currentState READ currentState NOTIFY debugStatsChanged)

public:
    explicit DebugController(StateManager* state, SerialService* serial, MqttService* mqtt, QObject* parent = nullptr);

    QString lastPacketType() const { return m_lastPacketType; }
    int packetCount() const { return m_packetCount; }
    bool uartConnected() const { return m_uartConnected; }
    bool mqttConnected() const { return m_mqttConnected; }
    QString currentState() const;

signals:
    void debugStatsChanged();

private slots:
    void onPacketReceived(SmartCart::Protocol::Command cmd, const uint8_t* payload, uint8_t len);

private:
    StateManager* m_state;
    SerialService* m_serial;
    MqttService* m_mqtt;

    QString m_lastPacketType;
    int m_packetCount;
    bool m_uartConnected;
    bool m_mqttConnected;
};

#endif