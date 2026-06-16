#include "STM32WeightSensor.h"
#include "../../services/SerialService.h"
#include "../../../protocols/include/packet.hpp"

STM32WeightSensor::STM32WeightSensor(SerialService* serialService, QObject* parent)
    : IWeightSensor(parent), m_serialService(serialService)
{
    if (m_serialService) {
        connect(m_serialService, &SerialService::packetReceived, this, [this](SmartCart::Protocol::Command cmd, const uint8_t* payload, uint8_t len) {
            onPacketReceived(static_cast<int>(cmd), payload, len);
        });
    }
}

void STM32WeightSensor::onPacketReceived(int cmd, const uint8_t* payload, uint8_t len) {
    if (static_cast<SmartCart::Protocol::Command>(cmd) == SmartCart::Protocol::Command::CMD_WEIGHT_TELEMETRY) {
        const auto* wp = reinterpret_cast<const SmartCart::Protocol::WeightPayload*>(payload);
        emit weightChanged(wp->weight_grams);
    }
}