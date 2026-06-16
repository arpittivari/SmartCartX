#include "ShoppingService.h"
#include <QDebug>

ShoppingService::ShoppingService(TelemetryService* telemetry, IWeightSensor* weightSensor, IBarcodeScanner* scanner, IAudioPlayer* audio, QObject *parent)
    : QObject(parent), m_telemetry(telemetry), m_weightSensor(weightSensor), m_scanner(scanner), m_audio(audio)
{
    if (m_weightSensor) {
        connect(m_weightSensor, &IWeightSensor::weightChanged, this, &ShoppingService::onWeightChanged);
    }
    if (m_scanner) {
        connect(m_scanner, &IBarcodeScanner::barcodeScanned, this, &ShoppingService::onBarcodeScanned);
    }
}

void ShoppingService::startSession(const CustomerProfile& customer) {
    m_session.start(customer);
    qDebug() << "[ShoppingService] Session started:" << m_session.sessionId() << "for customer:" << customer.identifier();
    
    if (m_telemetry) {
        m_telemetry->updateState(CartState::SHOPPING);
        m_telemetry->publishSessionUpdate(m_session);
    }
}

void ShoppingService::onWeightChanged(int grams) {
    qDebug() << "[ShoppingService] Processing Weight Event:" << grams << "g";
    if (m_telemetry) {
        m_telemetry->publishWeightUpdate(grams);
    }
}

void ShoppingService::onBarcodeScanned(const QString& data) {
    qDebug() << "[ShoppingService] Barcode Scanned:" << data;
    if (m_audio) {
        m_audio->playSound(SoundEvent::ITEM_ADDED);
    }
}

void ShoppingService::endSession() {
    m_session.end();
    qDebug() << "[ShoppingService] Session ended:" << m_session.sessionId();
    
    if (m_telemetry) {
        m_telemetry->updateState(CartState::READY);
        m_telemetry->publishSessionUpdate(m_session);
    }
}