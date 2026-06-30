#ifndef STM32_BATTERY_MONITOR_H
#define STM32_BATTERY_MONITOR_H

#include "../interfaces/IBatteryMonitor.h"

// Forward stub
class STM32BatteryMonitor : public IBatteryMonitor {
    Q_OBJECT
public:
    explicit STM32BatteryMonitor(class SerialService* serialService, QObject* parent = nullptr);
    virtual ~STM32BatteryMonitor() = default;

private slots:
    void onPacketReceived(int cmd, const uint8_t* payload, uint8_t len);

private:
    class SerialService* m_serialService;
};

#endif