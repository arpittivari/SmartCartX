#ifndef CART_STATUS_MODEL_H
#define CART_STATUS_MODEL_H

#include <QString>
#include <QJsonObject>

enum class CartState {
    ONLINE,
    OFFLINE,
    PROVISIONING,
    READY,
    SHOPPING,
    CHECKOUT_PENDING
};

class CartStatusModel {
public:
    CartStatusModel();

    void setBattery(float pct) { m_batteryPct = pct; }
    float battery() const { return m_batteryPct; }

    void setHealth(int health) { m_health = health; }
    int health() const { return m_health; }

    void setState(CartState state) { m_state = state; }
    CartState state() const { return m_state; }
    
    QString stateToString() const;

    QJsonObject toJson() const {
        QJsonObject obj;
        obj["battery"] = m_batteryPct;
        obj["health"] = m_health;
        obj["state"] = stateToString();
        return obj;
    }

private:
    float m_batteryPct;
    int m_health;
    CartState m_state;
};

#endif
