#ifndef SHOPPING_SESSION_H
#define SHOPPING_SESSION_H

#include <QString>
#include <QDateTime>
#include "CustomerProfile.h"

class ShoppingSession {
public:
    ShoppingSession();

    void start(const CustomerProfile& customer);
    void end();
    bool isActive() const { return m_isActive; }
    
    QString sessionId() const { return m_sessionId; }
    CustomerProfile customer() const { return m_customer; }

private:
    QString m_sessionId;
    CustomerProfile m_customer;
    QDateTime m_startTime;
    QDateTime m_endTime;
    bool m_isActive;
};

#endif