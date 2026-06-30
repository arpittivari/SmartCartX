#ifndef SIMULATED_BATTERY_MONITOR_H
#define SIMULATED_BATTERY_MONITOR_H

#include "../interfaces/IBatteryMonitor.h"
#include <QTimer>

class SimulatedBatteryMonitor : public IBatteryMonitor {
    Q_OBJECT
public:
    explicit SimulatedBatteryMonitor(QObject* parent = nullptr);

public slots:
    void startMocking();
    void stopMocking();

private slots:
    void onBatteryTick();

private:
    QTimer* m_timer;
    float m_mockBatteryPct;
};

#endif