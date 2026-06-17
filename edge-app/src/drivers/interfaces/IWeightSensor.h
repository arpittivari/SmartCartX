#ifndef IWEIGHT_SENSOR_H
#define IWEIGHT_SENSOR_H

#include <QObject>

class IWeightSensor : public QObject {
    Q_OBJECT
public:
    explicit IWeightSensor(QObject* parent = nullptr);
    virtual ~IWeightSensor();

signals:
    void weightChanged(int weightGrams);
};

#endif
