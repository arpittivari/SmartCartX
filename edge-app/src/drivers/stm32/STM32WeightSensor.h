#ifndef STM32_WEIGHT_SENSOR_H
#define STM32_WEIGHT_SENSOR_H

#include "../interfaces/IWeightSensor.h"

// Forward stub
class STM32WeightSensor : public IWeightSensor {
    Q_OBJECT
public:
    explicit STM32WeightSensor(class SerialService* serialService, QObject* parent = nullptr);
    virtual ~STM32WeightSensor() = default;

private slots:
    void onPacketReceived(int cmd, const uint8_t* payload, uint8_t len);

private:
    class SerialService* m_serialService;
};

#endif