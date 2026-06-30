#ifndef JETSON_CAMERA_H
#define JETSON_CAMERA_H

#include "../interfaces/ICamera.h"

// Forward stub
class JetsonCamera : public ICamera {
    Q_OBJECT
public:
    explicit JetsonCamera(QObject* parent = nullptr);
    virtual ~JetsonCamera();
    void startCapture() override {}
    void stopCapture() override {}
};

#endif
