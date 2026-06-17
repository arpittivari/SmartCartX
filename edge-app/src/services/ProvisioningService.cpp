#include "ProvisioningService.h"
#include <QDebug>
#include <QJsonDocument>
#include <QJsonObject>

ProvisioningService::ProvisioningService(MqttService* mqtt, ConfigManager* config, QObject *parent)
    : QObject(parent), m_mqtt(mqtt), m_config(config)
{
    connect(m_mqtt, &MqttService::messageReceived, this, &ProvisioningService::onMqttMessageReceived);
}

void ProvisioningService::startProvisioning() {
    qDebug() << "[ProvisioningService] Started provisioning flow.";
}

void ProvisioningService::submitMallId(const QString& mallId) {
    m_mallId = mallId;
    qDebug() << "[ProvisioningService] Mall ID submitted:" << mallId;
    
    // In a real device, MAC address would be gathered here
    QString macAddress = "AA:BB:CC:DD:EE:FF";
    
    // Subscribe to claim topic
    m_mqtt->subscribe(QString("smartcart/provisioning/claimed/%1").arg(macAddress));
    
    // Publish announce
    QJsonObject payload;
    payload["macAddress"] = macAddress;
    m_mqtt->publish(QString("smartcart/provisioning/announce/%1").arg(mallId), QJsonDocument(payload).toJson(QJsonDocument::Compact));
}

void ProvisioningService::onMqttMessageReceived(const QString& topic, const QString& payload) {
    // Only process if we are actively provisioning (mallId is set)
    if (m_mallId.isEmpty()) return;
    
    QString macAddress = "AA:BB:CC:DD:EE:FF"; // Mock
    QString claimTopic = QString("smartcart/provisioning/claimed/%1").arg(macAddress);
    
    if (topic == claimTopic) {
        QJsonDocument doc = QJsonDocument::fromJson(payload.toUtf8());
        if (doc.isObject()) {
            QJsonObject obj = doc.object();
            if (obj["status"].toString() == "claimed") {
                qDebug() << "[ProvisioningService] Device Claimed! Saving configuration...";
                
                QVariantMap configData;
                configData["mallId"] = m_mallId;
                configData["cartId"] = obj["cartId"].toString(macAddress);
                configData["mqttUser"] = obj["mqttUser"].toString(macAddress);
                configData["mqttPass"] = obj["mqttPass"].toString();
                
                if (obj.contains("mqttBroker")) {
                    configData["mqttBroker"] = obj["mqttBroker"].toString();
                }
                if (obj.contains("mqttPort")) {
                    configData["mqttPort"] = obj["mqttPort"].toInt();
                }

                m_config->saveConfig(configData);
                m_mallId.clear(); // Reset state
                
                emit provisioningComplete();
            }
        }
    }
}