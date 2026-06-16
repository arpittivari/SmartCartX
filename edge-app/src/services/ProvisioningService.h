#ifndef PROVISIONING_SERVICE_H
#define PROVISIONING_SERVICE_H

#include <QObject>
#include <QVariantMap>
#include "MqttService.h"
#include "../core/ConfigManager.h"

class ProvisioningService : public QObject {
    Q_OBJECT
public:
    explicit ProvisioningService(MqttService* mqtt, ConfigManager* config, QObject *parent = nullptr);
    virtual ~ProvisioningService() = default;

public slots:
    virtual void startProvisioning();
    virtual void submitMallId(const QString& mallId);

private slots:
    void onMqttMessageReceived(const QString& topic, const QString& payload);

signals:
    void provisioningComplete();

private:
    MqttService* m_mqtt;
    ConfigManager* m_config;
    QString m_mallId;
};

#endif