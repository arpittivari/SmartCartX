#ifndef ICAMERA_H
#define ICAMERA_H

#include <QObject>
#include <QImage>

class ICamera : public QObject {
    Q_OBJECT
public:
    explicit ICamera(QObject* parent = nullptr) : QObject(parent) {}
    virtual ~ICamera() = default;

    virtual void startCapture() = 0;
    virtual void stopCapture() = 0;

signals:
    void frameReady(const QImage& frame);
};

#endif