#ifndef SIMULATED_WEIGHT_SENSOR_H
#define SIMULATED_WEIGHT_SENSOR_H

#include "../interfaces/IWeightSensor.h"
#include <QTimer>

class SimulatedWeightSensor : public IWeightSensor {
    Q_OBJECT
public:
    explicit SimulatedWeightSensor(QObject* parent = nullptr);

public slots:
    void startMocking();
    void stopMocking();

private slots:
    void onWeightTick();

private:
    QTimer* m_timer;
};

#endif