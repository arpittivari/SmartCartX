#ifndef PC_WEBCAM_CAMERA_H
#define PC_WEBCAM_CAMERA_H

#include "../interfaces/ICamera.h"
// Use Qt Multimedia classes instead of OpenCV
#include <QMediaCaptureSession>
#include <QImageCapture>
#include <QCamera>

class PcWebcamCamera : public ICamera {
    Q_OBJECT
public:
    explicit PcWebcamCamera(QObject* parent = nullptr);
    virtual ~PcWebcamCamera();

    void startCapture() override;
    void stopCapture() override;

private slots:
    void onImageCaptured(int id, const QImage &preview);

private:
    QCamera* m_camera;
    QMediaCaptureSession* m_session;
    QImageCapture* m_imageCapture;
};

#endif