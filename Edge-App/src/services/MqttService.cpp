#include "MqttService.h"
#include <QDebug>
#include <QTimer>

MqttService::MqttService(QObject *parent)
    : QObject(parent), m_isConnected(false) {}

MqttService::~MqttService() {}

void MqttService::connectToBroker(const QString& broker, int port, const QString& clientId, const QString& user, const QString& pass) {
    qDebug() << "[MqttService-MOCK] Pretending to connect to" << broker << "as" << clientId;

    // 1 second baad fake success signal bhejenge
    QTimer::singleShot(1000, this, [this]() {
        m_isConnected = true;
        qDebug() << "[MqttService-MOCK] Connected (Fake)!";
        emit mqttConnected();
    });
}

void MqttService::disconnectFromBroker() {
    qDebug() << "[MqttService-MOCK] Disconnecting";
    m_isConnected = false;
    emit disconnected();
}

void MqttService::publish(const QString& topic, const QString& payload, int) {
    qDebug() << "[MqttService-MOCK] Pretending to publish -> Topic:" << topic << "Payload:" << payload;
}

void MqttService::subscribe(const QString& topic, int) {
    qDebug() << "[MqttService-MOCK] Pretending to subscribe -> Topic:" << topic;
}