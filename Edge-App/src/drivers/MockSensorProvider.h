#ifndef MOCK_SENSOR_PROVIDER_H
#define MOCK_SENSOR_PROVIDER_H

#include <QObject>
#include <QTimer>
#include "../services/TelemetryService.h"
#include "../services/ShoppingService.h"

class MockSensorProvider : public QObject {
    Q_OBJECT
public:
    explicit MockSensorProvider(TelemetryService* telemetry, ShoppingService* shopping, QObject* parent = nullptr);

public slots:
    void startMocking();
    void stopMocking();

private slots:
    void onTick();

private:
    TelemetryService* m_telemetry;
    ShoppingService* m_shopping;
    QTimer* m_timer;
    float m_mockBattery;
};

#endif