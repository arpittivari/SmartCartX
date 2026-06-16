# Hardware & PCB Architecture Proposal

## 1. System Block Diagram

```text
+-------------------------------------------------------------+
|                     CLOUD INFRASTRUCTURE                    |
| (Node.js Backend, HiveMQ/Mosquitto, Web Dashboard, DB)      |
+-------------------------------------------------------------+
                               ^
                               | Wi-Fi / 4G (MQTT QoS 1)
                               v
+-------------------------------------------------------------+
|                   NVIDIA JETSON ORIN NANO                   |
|                    (Embedded Linux OS)                      |
|                                                             |
| +-----------------+  +-----------------+  +---------------+ |
| |  Qt6 App (C++)  |  | Computer Vision |  |  Paho MQTT C++| |
| +-----------------+  +-----------------+  +---------------+ |
|                                                             |
|   [ USB-C ]      [ CSI/USB ]      [ HDMI/eDP ]   [ UART ]   |
+-------+---------------+----------------+------------+-------+
        |               |                |            |
     (Power)         (Camera)        (Touch        (Binary
        |               |             Display)     Protocol)
        |               |                |            |
+-------------------------------------------------------------+
|                      CUSTOM PCB / CARRIER                   |
|                                                             |
| +---------------------------------------------------------+ |
| |                       STM32F446                         | |
| |                      (FreeRTOS)                         | |
| +---------------------------------------------------------+ |
|     |            |             |              |             |
| [ I2C/SPI ]  [ GPIO ]      [ GPIO/PWM ]   [ UART ]      [ ADC ]
|     |            |             |              |             |
| (HX711/ADC) (Buttons)      (RGB LEDs,      (Debug)      (Battery
|     |                      Buzzer)                      Monitor)
|     |                                                       |
| [Load Cells]                                            [LiFePO4]
+-------------------------------------------------------------+
```

## 2. PCB Architecture Requirements

### 2.1 Power Delivery
- **Battery:** 12V or 24V LiFePO4 pack for extended runtime and safety.
- **Regulators:**
  - `5V / 5A` Buck Converter for Jetson Orin Nano / Display.
  - `3.3V / 1A` LDO/Buck for STM32 and logic level sensors.
- **Battery Monitoring:** Voltage divider to STM32 ADC + optional I2C Fuel Gauge (e.g., MAX17048) for accurate SoC.

### 2.2 Logic & Communication
- **STM32 to Jetson UART:** Direct 3.3V logic connection (TX/RX). Include a logic level shifter if the Jetson variant requires 1.8V IO.
- **Programming Interface:** SWD (Serial Wire Debug) header for STM32 flashing.
- **Load Cell Interface:** Footprint for HX711 (or a higher-quality SPI ADC like ADS1220 for industrial accuracy). Must include proper analog ground planes and shielding to prevent EMI from the Jetson.

### 2.3 Peripherals
- **RGB LEDs:** Headers for Neopixel (WS2812B) or standard PWM RGB LEDs to indicate cart status (Shopping, Error, Processing).
- **Buzzer:** Transistor-driven magnetic or piezo buzzer.

### 2.4 Environmental / Mechanical
- Conformal coating to protect against spills and condensation in grocery environments.
- Sturdy connectors (JST-XH or locking MOLEX) to prevent disconnections due to cart vibration.