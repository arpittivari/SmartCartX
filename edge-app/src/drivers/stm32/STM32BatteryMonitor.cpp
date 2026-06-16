#include "STM32BatteryMonitor.h"
#include "../../services/SerialService.h"
#include "../../../protocols/include/packet.hpp"

STM32BatteryMonitor::STM32BatteryMonitor(SerialService* serialService, QObject* parent)
    : IBatteryMonitor(parent), m_serialService(serialService)
{
    if (m_serialService) {
        connect(m_serialService, &SerialService::packetReceived, this, [this](SmartCart::Protocol::Command cmd, const uint8_t* payload, uint8_t len) {
            onPacketReceived(static_cast<int>(cmd), payload, len);
        });
    }
}

void STM32BatteryMonitor::onPacketReceived(int cmd, const uint8_t* payload, uint8_t len) {
    if (static_cast<SmartCart::Protocol::Command>(cmd) == SmartCart::Protocol::Command::CMD_BATTERY_TELEMETRY) {
        const auto* bp = reinterpret_cast<const SmartCart::Protocol::BatteryPayload*>(payload);
        emit batteryLevelChanged(static_cast<float>(bp->state_of_charge_pct));
    }
}