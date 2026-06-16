#include "ShoppingService.h"
#include <QDebug>

ShoppingService::ShoppingService(TelemetryService* telemetry, QObject *parent)
    : QObject(parent), m_telemetry(telemetry)
{
}

void ShoppingService::startSession(const CustomerProfile& customer) {
    m_session.start(customer);
    qDebug() << "[ShoppingService] Session started:" << m_session.sessionId() << "for customer:" << customer.identifier();
    
    if (m_telemetry) {
        m_telemetry->updateState(CartState::SHOPPING);
        m_telemetry->publishSessionUpdate(m_session);
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