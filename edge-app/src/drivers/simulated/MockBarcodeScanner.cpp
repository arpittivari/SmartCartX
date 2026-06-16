#include "MockBarcodeScanner.h"

MockBarcodeScanner::MockBarcodeScanner(QObject* parent) : IBarcodeScanner(parent) {
    m_timer = new QTimer(this);
    m_timer->setInterval(30000); // 30s mock scan
    connect(m_timer, &QTimer::timeout, this, &MockBarcodeScanner::onScanTick);
}

void MockBarcodeScanner::startMocking() { m_timer->start(); }
void MockBarcodeScanner::stopMocking() { m_timer->stop(); }

void MockBarcodeScanner::onScanTick() {
    emit barcodeScanned("00123456789012");
}