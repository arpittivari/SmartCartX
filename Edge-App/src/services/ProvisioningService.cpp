#include "ProvisioningService.h"
#include <QDebug>
#include <QJsonDocument>
#include <QJsonObject>
#include <QTimer>
ProvisioningService::ProvisioningService(MqttService* mqtt, ConfigManager* config, QObject *parent)
    : QObject(parent), m_mqtt(mqtt), m_config(config)
{
    connect(m_mqtt, &MqttService::messageReceived, this, &ProvisioningService::onMqttMessageReceived);
}

void ProvisioningService::startProvisioning() {
    qDebug() << "[ProvisioningService] Started provisioning flow.";

    // UI mein button nahi hai, isliye hum khud hi mock ID submit kar rahe hain
    qDebug() << "[ProvisioningService] Auto-submitting Mock Mall ID...";
    //submitMallId("MALL_123");
}

void ProvisioningService::submitMallId(const QString& mallId) {
    m_mallId = mallId;
    qDebug() << "[ProvisioningService-MOCK] Mall ID submitted:" << mallId;
    qDebug() << "[ProvisioningService-MOCK] Waiting 2 seconds for fake cloud approval...";

    // 2 Seconds baad device auto-claim ho jayega
    QTimer::singleShot(2000, this, [this]() {
        qDebug() << "[ProvisioningService-MOCK] Device Claimed! Saving configuration...";

        QVariantMap configData;
        configData["mallId"] = m_mallId;
        configData["cartId"] = "CART_MOCK_123";
        configData["mqttUser"] = "mock_user";
        configData["mqttPass"] = "mock_pass";

        m_config->saveConfig(configData);
        m_mallId.clear();

        emit provisioningComplete();
    });

}
void ProvisioningService::onMqttMessageReceived(const QString& topic, const QString& payload) {
    // Mock Mode: Yahan kuch nahi karna hai
}