#include "STM32ButtonInput.h"
#include "../../services/SerialService.h"
#include "packet.hpp"

STM32ButtonInput::STM32ButtonInput(SerialService* serialService, QObject* parent)
    : IButtonInput(parent), m_serialService(serialService)
{
    if (m_serialService) {
        connect(m_serialService, &SerialService::packetReceived, this, [this](SmartCart::Protocol::Command cmd, const uint8_t* payload, uint8_t len) {
            onPacketReceived(static_cast<int>(cmd), payload, len);
        });
    }
}

void STM32ButtonInput::onPacketReceived(int cmd, const uint8_t* payload, uint8_t len) {
    if (static_cast<SmartCart::Protocol::Command>(cmd) == SmartCart::Protocol::Command::CMD_BUTTON_EVENT) {
        const auto* btn = reinterpret_cast<const SmartCart::Protocol::ButtonPayload*>(payload);
        if (btn->event_type == 1) { // Pressed
            emit buttonPressed(btn->button_id);
        }
    }
}