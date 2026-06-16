#ifndef TELEMETRY_SERVICE_H
#define TELEMETRY_SERVICE_H

#include <QObject>
#include <QTimer>
#include "MqttService.h"
#include "../models/CartStatusModel.h"
#include "../models/ShoppingSession.h"

class TelemetryService : public QObject {
    Q_OBJECT
public:
    explicit TelemetryService(MqttService* mqtt, const QString& macAddress, QObject *parent = nullptr);
    virtual ~TelemetryService() = default;

public slots:
    virtual void startTelemetry();
    virtual void stopTelemetry();
    
    void updateBattery(float pct);
    void updateState(CartState state);
    void publishHeartbeat();
    void publishSessionUpdate(const ShoppingSession& session);

private slots:
    void onPublishTick();

private:
    MqttService* m_mqtt;
    QString m_macAddress;
    QTimer* m_timer;
    CartStatusModel m_model;
};

#endif