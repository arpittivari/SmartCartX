# UART Protocol Specification

## 1. Overview
Communication between the Jetson Edge App and the STM32 firmware uses a proprietary binary protocol over UART. This protocol replaces the legacy JSON-over-serial approach to provide lower latency, deterministic parsing, and improved reliability.

## 2. Physical Layer
- **Baud Rate:** 115200 (or up to 921600 depending on final testing)
- **Data Bits:** 8
- **Parity:** None
- **Stop Bits:** 1
- **Flow Control:** None
- **Endianness:** Little Endian

## 3. Packet Structure

All packets strictly adhere to the following structure:

| Field | Size (Bytes) | Description |
| :--- | :--- | :--- |
| **HEADER** | 2 | Magic bytes: `0xAA 0x55` |
| **COMMAND ID** | 1 | Identifies the payload type (see below). |
| **PAYLOAD_LEN** | 1 | Length of the `PAYLOAD` field (0-255 bytes). |
| **PAYLOAD** | N | Command-specific binary data structure. |
| **CRC16** | 2 | CRC16 CCITT-FALSE computed over `[COMMAND ID, PAYLOAD_LEN, PAYLOAD]`. |

## 4. Command IDs and Payloads

### Jetson -> STM32 (Commands)

#### `0x10`: TARE_SCALE
- **Payload Length:** 0
- **Payload:** None
- **Description:** Instructs the STM32 to tare the load cell.

#### `0x11`: SET_LED_STATE
- **Payload Length:** 3
- **Payload Struct:**
  ```c
  struct __attribute__((packed)) {
      uint8_t red;
      uint8_t green;
      uint8_t blue;
  } LedPayload;
  ```
- **Description:** Sets the RGB LED color.

#### `0x12`: TRIGGER_BUZZER
- **Payload Length:** 1
- **Payload Struct:**
  ```c
  struct __attribute__((packed)) {
      uint8_t pattern; // 0=Short, 1=Success, 2=Error
  } BuzzerPayload;
  ```
- **Description:** Plays a predefined buzzer pattern.

### STM32 -> Jetson (Events/Telemetry)

#### `0x20`: WEIGHT_UPDATE
- **Payload Length:** 4
- **Payload Struct:**
  ```c
  struct __attribute__((packed)) {
      int32_t weight_grams;
  } WeightPayload;
  ```
- **Description:** Sent continuously or when a stable weight change is detected.

#### `0x21`: BATTERY_TELEMETRY
- **Payload Length:** 4
- **Payload Struct:**
  ```c
  struct __attribute__((packed)) {
      uint16_t voltage_mv;
      uint8_t state_of_charge_pct;
      uint8_t is_charging; // 1=Yes, 0=No
  } BatteryPayload;
  ```
- **Description:** Sent periodically (e.g., every 10 seconds).

#### `0x22`: BUTTON_EVENT
- **Payload Length:** 1
- **Payload Struct:**
  ```c
  struct __attribute__((packed)) {
      uint8_t button_id; // e.g., 1=Help Button
  } ButtonPayload;
  ```

## 5. CRC16 Details
- **Algorithm:** CRC-16/CCITT-FALSE
- **Polynomial:** `0x1021`
- **Initial Value:** `0xFFFF`
- **Reflect Input/Output:** False
- **XOR Out:** `0x0000`

## 6. Error Handling
- If `HEADER` is not `0xAA 0x55`, the parser shifts by 1 byte and searches again.
- If `CRC16` fails, the packet is silently dropped (or a diagnostic counter is incremented). No NACK is sent to avoid bus congestion.