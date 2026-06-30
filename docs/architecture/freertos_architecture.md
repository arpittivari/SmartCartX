# FreeRTOS Architecture

## 1. Overview
The STM32 firmware relies on FreeRTOS to guarantee deterministic timing for sensor reads while simultaneously handling asynchronous UART communications and UI (LED/Buzzer) tasks. This document outlines the task definitions, priorities, and Inter-Process Communication (IPC) mechanisms.

## 2. Task Definitions & Priorities

| Task Name | Priority | Stack Size (Words) | Frequency/Trigger | Description |
| :--- | :--- | :--- | :--- | :--- |
| **WatchdogTask** | `osPriorityRealtime` (Highest) | 128 | Periodic (e.g., 500ms) | Feeds IWDG, checks task health. |
| **WeightTask** | `osPriorityHigh` | 512 | Periodic (e.g., 10ms) | Reads HX711, filters data, detects stability. |
| **UartRxTask** | `osPriorityAboveNormal` | 512 | Event-Driven (RX DMA ISR) | Parses incoming UART bytes, verifies CRC. |
| **UartTxTask** | `osPriorityAboveNormal` | 512 | Event-Driven (Queue) | Formats and transmits binary packets. |
| **BatteryTask** | `osPriorityNormal` | 256 | Periodic (e.g., 10000ms) | Reads ADC, calculates battery %. |
| **LedTask** | `osPriorityBelowNormal` | 256 | Event-Driven (Queue) | Drives RGB LEDs (PWM/GPIO). |
| **BuzzerTask** | `osPriorityBelowNormal` | 256 | Event-Driven (Queue) | Controls buzzer sequences. |

*Note: Stack sizes are estimates and must be tuned using `uxTaskGetStackHighWaterMark()` during development.*

## 3. Inter-Task Communication (IPC)

Strict rules apply to data sharing to prevent race conditions:
- **No Global Variables:** State must be passed via FreeRTOS Queues or protected by Mutexes.
- **Queues for Commands/Events:** Preferred method for task interaction.

### 3.1 Primary Queues

#### `tx_message_queue`
- **Producer(s):** WeightTask, BatteryTask, ButtonTask.
- **Consumer:** UartTxTask.
- **Data Type:** `UartMessage_t` (Internal struct containing command ID and payload data).

#### `led_command_queue`
- **Producer(s):** UartRxTask (upon receiving command from Jetson).
- **Consumer:** LedTask.
- **Data Type:** `LedCommand_t` (Color, Blink Rate, Duration).

#### `buzzer_command_queue`
- **Producer(s):** UartRxTask.
- **Consumer:** BuzzerTask.
- **Data Type:** `BuzzerCommand_t` (Pattern Enum: Success, Error, Beep).

## 4. Interrupt Service Routines (ISRs)

ISRs must be kept extremely short. Use FreeRTOS `FromISR` API variants to defer processing to tasks.

- **UART RX DMA Interrupt:** Triggers when a chunk of data is received. Yields to `UartRxTask` using `vTaskNotifyGiveFromISR`.
- **Timer Interrupts (optional):** Used for precise HX711 clocking if bit-banging is required, though hardware SPI/Timers are preferred.

## 5. Memory Management
- **Static Allocation:** `configSUPPORT_STATIC_ALLOCATION` should be set to `1`. Define task stacks, TCBs, and queues statically at compile time to prevent heap fragmentation issues during long uptime.