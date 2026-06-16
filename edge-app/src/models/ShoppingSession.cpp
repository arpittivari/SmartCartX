#include "ShoppingSession.h"
#include <QUuid>

ShoppingSession::ShoppingSession() : m_isActive(false) {
}

void ShoppingSession::start(const CustomerProfile& customer) {
    m_sessionId = QUuid::createUuid().toString(QUuid::WithoutBraces);
    m_customer = customer;
    m_startTime = QDateTime::currentDateTime();
    m_isActive = true;
}

void ShoppingSession::end() {
    m_endTime = QDateTime::currentDateTime();
    m_isActive = false;
}