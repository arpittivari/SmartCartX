#ifndef STM32_SIMULATOR_H
#define STM32_SIMULATOR_H

#include <QObject>
#include <QTimer>
#include "../services/SerialService.h"

class Stm32Simulator : public QObject {
    Q_OBJECT
public:
    explicit Stm32Simulator(SerialService* serialService, QObject* parent = nullptr);

public slots:
    void startMocking();
    void stopMocking();

private slots:
    void onHeartbeatTick();
    void onBatteryTick();
    void onWeightTick();
    void onButtonTick();
    void onDiagnosticTick();

private:
    SerialService* m_serialService;
    QTimer* m_heartbeatTimer;
    QTimer* m_batteryTimer;
    QTimer* m_weightTimer;
    QTimer* m_buttonTimer;
    QTimer* m_diagnosticTimer;
    
    uint32_t m_uptime;
    uint8_t m_mockBatteryPct;
};

#endif