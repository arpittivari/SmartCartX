#ifndef IWEIGHT_SENSOR_H
#define IWEIGHT_SENSOR_H

#include <QObject>

class IWeightSensor : public QObject {
    Q_OBJECT
public:
    explicit IWeightSensor(QObject* parent = nullptr) : QObject(parent) {}
    virtual ~IWeightSensor() = default;

signals:
    void weightChanged(int grams);
};

#endif