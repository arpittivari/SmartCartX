#ifndef IBATTERY_MONITOR_H
#define IBATTERY_MONITOR_H

#include <QObject>

class IBatteryMonitor : public QObject {
    Q_OBJECT
public:
    explicit IBatteryMonitor(QObject* parent = nullptr);
    virtual ~IBatteryMonitor();

signals:
    void batteryLevelChanged(float level);
};

#endif
