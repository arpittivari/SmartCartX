# Qt Application Architecture

## 1. Overview
The Edge Application runs on an Embedded Linux environment (NVIDIA Jetson). It is built using Qt6 (C++ for core logic, QML for UI) and uses Eclipse Paho MQTT C++ for cloud connectivity. It acts as the central orchestrator for the Smart Cart, handling UI, state management, computer vision (OCR/Future AI), cloud synchronization, and delegating hardware control to the STM32 via UART.

## 2. Core Principles
- **Strict Separation of Concerns:** C++ handles all business logic, hardware interaction, and networking. QML handles purely rendering and user interactions.
- **Service-Oriented Architecture:** Logic is grouped into isolated singleton services (e.g., `MqttService`, `ProvisioningService`) registered with a central `AppContext`.
- **State-Driven Workflow:** Application flow strictly follows a Finite State Machine (FSM) to prevent sequence errors.
- **Non-blocking UI:** All network (MQTT) and hardware (UART/Camera) drivers run in separate threads or use Qt's asynchronous event loop.

## 3. High-Level Component Diagram

```text
+-----------------------------------------------------+
|                     QML (UI Layer)                  |
|  Views: Login, Shopping, Checkout, Provisioning     |
+-----------------------------------------------------+
                         | (Signals / Slots / Q_PROPERTY)
+-----------------------------------------------------+
|                 C++ Controllers & ViewModels        |
|  Exposed to QML via QML_ELEMENT / rootContext       |
+-----------------------------------------------------+
                         |
+-----------------------------------------------------+
|               Core State Machine (FSM)              |
|  Orchestrates transitions based on Service signals  |
+-----------------------------------------------------+
                         |
+-----------------------------------------------------+
|                     Services                        |
| - ProvisioningService  - MqttService (Paho)         |
| - ShoppingService      - ValidationService          |
| - TelemetryService     - HttpService                |
+-----------------------------------------------------+
           |                             |
+-----------------------+     +-----------------------+
|  Drivers (Hardware)   |     |  Drivers (System)     |
| - UartDriver (STM32)  |     | - CameraDriver (V4L2) |
+-----------------------+     +-----------------------+
```

## 4. Key Components

### 4.1 State Machine (`core/state_machine`)
Manages the application lifecycle. Handles transitions between:
- `BootState`
- `ProvisioningState`
- `WaitingForApprovalState`
- `CustomerOnboardingState`
- `ActiveShoppingState`
- `CheckoutPendingState`
- `PaymentCompleteState`

### 4.2 MQTT Integration (`services/mqtt`)
- Replaces QtMqtt completely.
- Wraps Eclipse Paho MQTT C++ in a Qt-friendly `QObject`.
- **Responsibilities:** Connect/Disconnect, Subscribe to topics (`commands`, `ads`, `provisioning/claimed`), Publish telemetry and events, automatic reconnection handling.
- **Threading:** Paho's background network threads must be safely bridged to Qt's main event loop using `QMetaObject::invokeMethod` or Qt signals.

### 4.3 Provisioning Service (`services/provisioning`)
- Checks for existence of `config/cart_config.ini`.
- If missing, triggers `ProvisioningState`.
- Communicates with MqttService to broadcast `announce` and await `claimed`.
- Once claimed, persists Mall ID, Cart ID, and credentials, then triggers a device reboot.

### 4.4 Telemetry Service (`services/telemetry`)
- Periodically (e.g., 60s) polls `UartDriver` for battery, and `State Machine` for current status.
- Packages data into JSON and delegates to `MqttService` to publish to the cloud.

### 4.5 UART Driver (`drivers/serial_driver`)
- Wraps `QSerialPort`.
- Runs asynchronously.
- Reads binary packets from the STM32, validates the CRC16, and dispatches parsed C++ structs/signals to the relevant services (e.g., `weight_added` -> `ShoppingService`).