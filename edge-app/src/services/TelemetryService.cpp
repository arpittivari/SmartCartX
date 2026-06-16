#include "TelemetryService.h"
#include <QJsonDocument>
#include <QJsonObject>
#include <QDebug>

TelemetryService::TelemetryService(MqttService* mqtt, IBatteryMonitor* batteryMonitor, const QString& macAddress, QObject *parent)
    : QObject(parent), m_mqtt(mqtt), m_batteryMonitor(batteryMonitor), m_macAddress(macAddress)
{
    m_timer = new QTimer(this);
    m_timer->setInterval(60000); // 60 seconds interval matching Python legacy
    connect(m_timer, &QTimer::timeout, this, &TelemetryService::onPublishTick);
    
    m_watchdogTimer = new QTimer(this);
    m_watchdogTimer->setInterval(15000); // Expect heartbeat every 5s, timeout after 15s
    m_watchdogTimer->setSingleShot(true);
    connect(m_watchdogTimer, &QTimer::timeout, this, &TelemetryService::onHeartbeatTimeout);
    
    if (m_batteryMonitor) {
        connect(m_batteryMonitor, &IBatteryMonitor::batteryLevelChanged, this, &TelemetryService::onBatteryLevelChanged);
    }
}

void TelemetryService::setBatteryMonitor(IBatteryMonitor* monitor) {
    if (m_batteryMonitor) {
        disconnect(m_batteryMonitor, &IBatteryMonitor::batteryLevelChanged, this, &TelemetryService::onBatteryLevelChanged);
    }
    m_batteryMonitor = monitor;
    if (m_batteryMonitor) {
        connect(m_batteryMonitor, &IBatteryMonitor::batteryLevelChanged, this, &TelemetryService::onBatteryLevelChanged);
    }
}

void TelemetryService::startTelemetry() {
    qDebug() << "[TelemetryService] Starting...";
    m_model.setState(CartState::READY);
    m_timer->start();
    // Publish initial status immediately
    onPublishTick();
}

void TelemetryService::stopTelemetry() {
    qDebug() << "[TelemetryService] Stopping...";
    m_timer->stop();
    m_watchdogTimer->stop();
    m_model.setState(CartState::OFFLINE);
    onPublishTick();
}

void TelemetryService::onBatteryLevelChanged(float pct) {
    m_model.setBattery(pct);
}

void TelemetryService::updateState(CartState state) {
    m_model.setState(state);
    // Push critical state changes immediately instead of waiting for the 60s tick
    onPublishTick(); 
}

void TelemetryService::publishHeartbeat() {
    // Usually triggered by STM32 UART packets
    
    // Reset watchdog timer because device is alive
    if (m_model.health() == 0) { // If it was offline, bring it back online
        m_model.setHealth(100);
        updateState(CartState::ONLINE); 
    }
    m_watchdogTimer->start();
    
    QJsonObject payload;
    payload["status"] = "alive";
    
    QString topic = QString("smartcart/%1/heartbeat").arg(m_macAddress);
    m_mqtt->publish(topic, QJsonDocument(payload).toJson(QJsonDocument::Compact));
}

void TelemetryService::onHeartbeatTimeout() {
    qWarning() << "[TelemetryService] Hardware Heartbeat timeout. Marking device offline/degraded.";
    m_model.setHealth(0);
    updateState(CartState::OFFLINE);
}

void TelemetryService::publishSessionUpdate(const ShoppingSession& session) {
    QJsonObject payload;
    payload["sessionId"] = session.sessionId();
    payload["customerId"] = session.customer().id();
    payload["customerIdentifier"] = session.customer().identifier();
    payload["isActive"] = session.isActive();
    
    QString topic = QString("smartcart/%1/session").arg(m_macAddress);
    m_mqtt->publish(topic, QJsonDocument(payload).toJson(QJsonDocument::Compact));
}

void TelemetryService::publishWeightUpdate(int grams) {
    QJsonObject payload;
    payload["weight_grams"] = grams;
    
    QString topic = QString("smartcart/%1/weight").arg(m_macAddress);
    m_mqtt->publish(topic, QJsonDocument(payload).toJson(QJsonDocument::Compact));
}

void TelemetryService::onPublishTick() {
    QJsonObject payload;
    payload["battery"] = static_cast<double>(m_model.battery());
    payload["health"] = m_model.health();
    payload["state"] = m_model.stateToString();
    
    QString topic = QString("smartcart/%1/telemetry").arg(m_macAddress);
    m_mqtt->publish(topic, QJsonDocument(payload).toJson(QJsonDocument::Compact));
}