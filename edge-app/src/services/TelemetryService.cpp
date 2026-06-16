#include "TelemetryService.h"
#include <QJsonDocument>
#include <QJsonObject>
#include <QDebug>

TelemetryService::TelemetryService(MqttService* mqtt, const QString& macAddress, QObject *parent)
    : QObject(parent), m_mqtt(mqtt), m_macAddress(macAddress)
{
    m_timer = new QTimer(this);
    m_timer->setInterval(60000); // 60 seconds interval matching Python legacy
    connect(m_timer, &QTimer::timeout, this, &TelemetryService::onPublishTick);
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
    m_model.setState(CartState::OFFLINE);
    onPublishTick();
}

void TelemetryService::updateBattery(float pct) {
    m_model.setBattery(pct);
}

void TelemetryService::updateState(CartState state) {
    m_model.setState(state);
    // Push critical state changes immediately instead of waiting for the 60s tick
    onPublishTick(); 
}

void TelemetryService::publishHeartbeat() {
    // Usually triggered by STM32 UART packets
    QJsonObject payload;
    payload["status"] = "alive";
    
    QString topic = QString("smartcart/%1/heartbeat").arg(m_macAddress);
    m_mqtt->publish(topic, QJsonDocument(payload).toJson(QJsonDocument::Compact));
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

void TelemetryService::onPublishTick() {
    QJsonObject payload;
    payload["battery"] = static_cast<double>(m_model.battery());
    payload["health"] = m_model.health();
    payload["state"] = m_model.stateToString();
    
    QString topic = QString("smartcart/%1/telemetry").arg(m_macAddress);
    m_mqtt->publish(topic, QJsonDocument(payload).toJson(QJsonDocument::Compact));
}