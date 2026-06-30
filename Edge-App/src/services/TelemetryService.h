#ifndef TELEMETRY_SERVICE_H
#define TELEMETRY_SERVICE_H

#include <QObject>
#include <QTimer>
#include <QJsonObject>
#include <QJsonDocument>
#include "MqttService.h"
#include "../models/CartStatusModel.h"
#include "../models/ShoppingSession.h"

#include "../drivers/interfaces/IBatteryMonitor.h"

class TelemetryService : public QObject {
    Q_OBJECT
public:
    explicit TelemetryService(MqttService* mqtt, IBatteryMonitor* batteryMonitor, const QString& macAddress, QObject *parent = nullptr);
    virtual ~TelemetryService() = default;

    void setBatteryMonitor(IBatteryMonitor* monitor);

public slots:
    virtual void startTelemetry();
    virtual void stopTelemetry();
    
    void updateState(CartState state);
    void publishHeartbeat();
    void publishSessionUpdate(const ShoppingSession& session);
    void publishWeightUpdate(int grams);

    // Shopping Engine integration
    void publishItemEvent(const QString& eventType, const QString& sku, double price);
    void publishCartTotal(int quantity, double price, double weight);
    void publishSessionStarted(const QString& sessionId, const QString& customerId);
    void publishSessionEnded(const QString& sessionId);

private slots:
    void onPublishTick();
    void onHeartbeatTimeout();
    void onBatteryLevelChanged(float pct);

private:
    MqttService* m_mqtt;
    IBatteryMonitor* m_batteryMonitor;
    QString m_macAddress;
    QTimer* m_timer;
    QTimer* m_watchdogTimer;
    CartStatusModel m_model;
};

#endif
