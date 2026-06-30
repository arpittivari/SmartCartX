#include "PcWebcamCamera.h"
#include <QDebug>

PcWebcamCamera::PcWebcamCamera(QObject* parent) : ICamera(parent) {
    m_camera = new QCamera(this);
    m_imageCapture = new QCameraImageCapture(m_camera);

    connect(m_imageCapture, &QCameraImageCapture::imageCaptured, this, &PcWebcamCamera::onImageCaptured);
}

PcWebcamCamera::~PcWebcamCamera() {
    stopCapture();
}

void PcWebcamCamera::startCapture() {
    qDebug() << "[PcWebcamCamera] Starting camera...";
    m_camera->start();
}

void PcWebcamCamera::stopCapture() {
    qDebug() << "[PcWebcamCamera] Stopping camera...";
    m_camera->stop();
}

void PcWebcamCamera::onImageCaptured(int id, const QImage &preview) {
    qDebug() << "[PcWebcamCamera] Frame ready.";
    emit frameReady(preview);
}
