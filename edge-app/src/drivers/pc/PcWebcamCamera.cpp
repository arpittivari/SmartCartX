#include "PcWebcamCamera.h"
#include <QDebug>

PcWebcamCamera::PcWebcamCamera(QObject* parent) : ICamera(parent) {
    m_camera = new QCamera(this);
    m_session = new QMediaCaptureSession(this);
    m_imageCapture = new QImageCapture(this);

    m_session->setCamera(m_camera);
    m_session->setImageCapture(m_imageCapture);

    connect(m_imageCapture, &QImageCapture::imageCaptured, this, &PcWebcamCamera::onImageCaptured);
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