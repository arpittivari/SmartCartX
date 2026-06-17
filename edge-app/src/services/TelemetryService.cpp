#include "TelemetryService.h"
#include <QDebug>

TelemetryService::TelemetryService(MqttService* mqtt, IBatteryMonitor* batteryMonitor, const QString& macAddress, QObject *parent)
    : QObject(parent), m_mqtt(mqtt), m_batteryMonitor(batteryMonitor), m_macAddress(macAddress)
{
    m_timer = new QTimer(this);
    m_timer->setInterval(5000); // 5 sec interval for regular telemetry
    connect(m_timer, &QTimer::timeout, this, &TelemetryService::onPublishTick);

    m_watchdogTimer = new QTimer(this);
    m_watchdogTimer->setInterval(30000); // 30 sec heartbeat/watchdog
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
    qDebug() << "[TelemetryService] Starting telemetry pipelines.";
    m_timer->start();
    m_watchdogTimer->start();
}

void TelemetryService::stopTelemetry() {
    m_timer->stop();
    m_watchdogTimer->stop();
}

void TelemetryService::updateState(CartState state) {
    m_model.setState(state);

    // Publish immediate state change
    QJsonObject payload = m_model.toJson();
    m_mqtt->publish("carts/telemetry/state", QJsonDocument(payload).toJson(QJsonDocument::Compact));
}

void TelemetryService::publishHeartbeat() {
    QJsonObject payload;
    payload["mac"] = m_macAddress;
    payload["timestamp"] = QDateTime::currentSecsSinceEpoch();
    payload["health"] = "OK";
    
    m_mqtt->publish("carts/telemetry/heartbeat", QJsonDocument(payload).toJson(QJsonDocument::Compact));
}

void TelemetryService::publishSessionUpdate(const ShoppingSession& session) {
    QJsonObject payload;
    payload["sessionId"] = session.sessionId();
    payload["customerId"] = session.customer().identifier();
    payload["active"] = session.isActive();
    payload["timestamp"] = QDateTime::currentSecsSinceEpoch();
    
    m_mqtt->publish("carts/telemetry/session", QJsonDocument(payload).toJson(QJsonDocument::Compact));
}

void TelemetryService::publishWeightUpdate(int grams) {
    QJsonObject payload;
    payload["mac"] = m_macAddress;
    payload["weight_g"] = grams;
    payload["timestamp"] = QDateTime::currentSecsSinceEpoch();
    
    m_mqtt->publish("carts/telemetry/weight", QJsonDocument(payload).toJson(QJsonDocument::Compact));
}

void TelemetryService::publishItemEvent(const QString& eventType, const QString& sku, double price) {
    QJsonObject payload;
    payload["event"] = eventType;
    payload["sku"] = sku;
    payload["price"] = price;
    payload["timestamp"] = QDateTime::currentSecsSinceEpoch();
    m_mqtt->publish("carts/telemetry/items", QJsonDocument(payload).toJson(QJsonDocument::Compact));
}

void TelemetryService::publishCartTotal(int quantity, double price, double weight) {
    QJsonObject payload;
    payload["event"] = "CART_TOTAL_UPDATED";
    payload["total_qty"] = quantity;
    payload["total_price"] = price;
    payload["total_weight"] = weight;
    payload["timestamp"] = QDateTime::currentSecsSinceEpoch();
    m_mqtt->publish("carts/telemetry/totals", QJsonDocument(payload).toJson(QJsonDocument::Compact));
}

void TelemetryService::publishSessionStarted(const QString& sessionId, const QString& customerId) {
    QJsonObject payload;
    payload["event"] = "SESSION_STARTED";
    payload["sessionId"] = sessionId;
    payload["customerId"] = customerId;
    payload["timestamp"] = QDateTime::currentSecsSinceEpoch();
    m_mqtt->publish("carts/telemetry/session_events", QJsonDocument(payload).toJson(QJsonDocument::Compact));
}

void TelemetryService::publishSessionEnded(const QString& sessionId) {
    QJsonObject payload;
    payload["event"] = "SESSION_ENDED";
    payload["sessionId"] = sessionId;
    payload["timestamp"] = QDateTime::currentSecsSinceEpoch();
    m_mqtt->publish("carts/telemetry/session_events", QJsonDocument(payload).toJson(QJsonDocument::Compact));
}

void TelemetryService::onPublishTick() {
    // Regular cyclic telemetry
    QJsonObject payload = m_model.toJson();
    payload["mac"] = m_macAddress;
    m_mqtt->publish("carts/telemetry/cyclic", QJsonDocument(payload).toJson(QJsonDocument::Compact));
}

void TelemetryService::onHeartbeatTimeout() {
    publishHeartbeat();
}

void TelemetryService::onBatteryLevelChanged(float pct) {
    m_model.setBattery(pct);
    // Publish immediate battery alert if low, otherwise let cyclic handle it
    if (pct < 15.0f) {
        QJsonObject payload;
        payload["alert"] = "BATTERY_LOW";
        payload["level"] = pct;
        payload["mac"] = m_macAddress;
        m_mqtt->publish("carts/alerts", QJsonDocument(payload).toJson(QJsonDocument::Compact));
    }
}
