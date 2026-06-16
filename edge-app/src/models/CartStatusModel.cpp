#include "CartStatusModel.h"

CartStatusModel::CartStatusModel()
    : m_batteryPct(100.0f), m_health(100), m_state(CartState::OFFLINE)
{
}

QString CartStatusModel::stateToString() const {
    switch (m_state) {
        case CartState::ONLINE: return "online";
        case CartState::OFFLINE: return "offline";
        case CartState::PROVISIONING: return "provisioning";
        case CartState::READY: return "idle"; // Mapped to Python legacy name
        case CartState::SHOPPING: return "shopping";
        case CartState::CHECKOUT_PENDING: return "checkout";
        default: return "unknown";
    }
}