#include "tasks.h"
#include "FreeRTOS.h"
#include "task.h"
#include "packet.hpp"

// Forward declaration for UART writing mock
void HAL_UART_Transmit_Mock(uint8_t* buffer, size_t length) {
    // In a real device, this uses HAL_UART_Transmit or DMA
}

void UartTask(void *pvParameters) { 
    for (;;) { 
        vTaskDelay(pdMS_TO_TICKS(5000)); // Heartbeat every 5s
        
        uint8_t tx_buffer[256];
        SmartCart::Protocol::HeartbeatPayload hb;
        // Mock uptime
        hb.uptime_ms = 5000; 
        
        size_t len = SmartCart::Protocol::PacketBuilder::build(
            SmartCart::Protocol::Command::CMD_HEARTBEAT, 
            reinterpret_cast<const uint8_t*>(&hb), 
            sizeof(hb), 
            tx_buffer, 
            sizeof(tx_buffer)
        );
        
        HAL_UART_Transmit_Mock(tx_buffer, len);
    } 
}

void WeightTask(void *pvParameters) { 
    for (;;) { 
        vTaskDelay(pdMS_TO_TICKS(10000)); // Mock weight change every 10s
        
        uint8_t tx_buffer[256];
        SmartCart::Protocol::WeightPayload w;
        w.weight_grams = 250; 
        
        size_t len = SmartCart::Protocol::PacketBuilder::build(
            SmartCart::Protocol::Command::CMD_WEIGHT_TELEMETRY, 
            reinterpret_cast<const uint8_t*>(&w), 
            sizeof(w), 
            tx_buffer, 
            sizeof(tx_buffer)
        );
        
        HAL_UART_Transmit_Mock(tx_buffer, len);
    } 
}

void BatteryTask(void *pvParameters) { 
    for (;;) { 
        vTaskDelay(pdMS_TO_TICKS(60000)); // Mock battery telemetry every 60s
        
        uint8_t tx_buffer[256];
        SmartCart::Protocol::BatteryPayload b;
        b.voltage_mv = 12500;
        b.state_of_charge_pct = 95;
        b.is_charging = 0;
        
        size_t len = SmartCart::Protocol::PacketBuilder::build(
            SmartCart::Protocol::Command::CMD_BATTERY_TELEMETRY, 
            reinterpret_cast<const uint8_t*>(&b), 
            sizeof(b), 
            tx_buffer, 
            sizeof(tx_buffer)
        );
        
        HAL_UART_Transmit_Mock(tx_buffer, len);
    } 
}

void LedTask(void *pvParameters) { for (;;) { vTaskDelay(pdMS_TO_TICKS(50)); } }
void WatchdogTask(void *pvParameters) { for (;;) { vTaskDelay(pdMS_TO_TICKS(500)); } }

void InitTasks(void) {
    xTaskCreate(UartTask, "UartTask", 512, NULL, tskIDLE_PRIORITY + 2, NULL);
    xTaskCreate(WeightTask, "WeightTask", 512, NULL, tskIDLE_PRIORITY + 3, NULL);
    xTaskCreate(BatteryTask, "BatteryTask", 256, NULL, tskIDLE_PRIORITY + 1, NULL);
    xTaskCreate(LedTask, "LedTask", 256, NULL, tskIDLE_PRIORITY + 1, NULL);
    xTaskCreate(WatchdogTask, "WatchdogTask", 128, NULL, configMAX_PRIORITIES - 1, NULL);
}