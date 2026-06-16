# STM32 Firmware Architecture

## 1. Overview
The STM32 microcontroller (primary target: STM32F446, future: STM32H7) serves as the hard-real-time sensor hub and actuator controller for the Smart Cart. It contains **zero business logic**. It exists solely to read sensors, drive outputs, and communicate deterministically with the Jetson over a binary UART protocol.

## 2. Core Principles
- **RTOS-Driven:** Built on FreeRTOS for preemptive multitasking and deterministic timing.
- **Dumb Terminal Concept:** The STM32 makes no decisions about the shopping flow. It simply reports events (e.g., "Weight changed to 250g") and responds to commands (e.g., "Set LED Green", "Beep Buzzer").
- **Robust Communication:** Communication with the Jetson uses a CRC-protected binary protocol to ensure data integrity in an electrically noisy environment.

## 3. High-Level Firmware Structure

```text
+-----------------------------------------------------+
|                  Main (FreeRTOS Init)               |
+-----------------------------------------------------+
                          |
+-----------------------------------------------------+
|                   Task Layer                        |
| - UartTask        - WeightTask      - BatteryTask   |
| - LedTask         - ButtonTask      - WatchdogTask  |
+-----------------------------------------------------+
        |                 |                  |
+---------------+ +---------------+ +-----------------+
|   Protocol    | |   Services    | |    Drivers      |
|  (Packet      | | (Calibration, | | (HX711, ADC,    |
|   Builder/    | |  Averaging)   | |  GPIO, Timer)   |
|   Parser)     | |               | |                 |
+---------------+ +---------------+ +-----------------+
                          |
+-----------------------------------------------------+
|                     STM32 HAL                       |
+-----------------------------------------------------+
```

## 4. Key Responsibilities

### 4.1 Weight Acquisition (`drivers/hx711` & `tasks/weight_task`)
- Interfaces with the HX711 Load Cell Amplifier.
- Runs at a high priority to ensure consistent sample rates.
- Applies moving average/low-pass filtering to raw ADC values.
- Implements a tare function (triggered via UART command).
- Detects stable weight changes and pushes an event to the `UartTask` queue.

### 4.2 Battery Monitoring (`drivers/battery` & `tasks/battery_task`)
- Reads the battery voltage via an internal ADC.
- Converts raw ADC values to voltage and estimates State of Charge (SoC).
- Periodically sends battery telemetry to the `UartTask`.

### 4.3 LED & Buzzer Control (`tasks/led_task`, `drivers/led`, `drivers/buzzer`)
- Manages GPIO/PWM for visual and auditory feedback.
- Listens to queues for commands from the Jetson (e.g., Success Beep, Error Beep, Processing LED animation).

### 4.4 UART Communication (`tasks/uart_task` & `protocol/`)
- Handles bidirectional communication with the Jetson.
- **TX:** Pulls events (Weight, Battery, Button) from a FreeRTOS queue, frames them with the Header, Command ID, Length, and CRC16, and transmits via DMA/Interrupts.
- **RX:** Receives bytes into a circular buffer using DMA, parses packets, verifies CRC16, and dispatches commands to the appropriate task queues (e.g., commanding the `LedTask`).

### 4.5 Diagnostics & Watchdog (`tasks/watchdog_task`)
- Feeds the hardware Independent Watchdog (IWDG).
- Monitors the health of other tasks (ensuring they haven't starved).
- Can force a soft reset if a fatal error occurs.