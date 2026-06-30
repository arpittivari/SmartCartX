#ifndef CUSTOMER_PROFILE_H
#define CUSTOMER_PROFILE_H

#include <QString>
#include <QDateTime>

class CustomerProfile {
public:
    CustomerProfile() = default;
    CustomerProfile(const QString& id, const QString& emailOrPhone);

    QString id() const { return m_id; }
    QString identifier() const { return m_identifier; }
    bool isValid() const { return !m_id.isEmpty(); }

private:
    QString m_id;
    QString m_identifier; // phone or email
};

#endif