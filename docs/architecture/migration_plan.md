# Smart Cart Migration Plan

## 1. Executive Summary

This document outlines the migration strategy for transitioning the Smart Cart platform from its initial Python/PyQt/ESP32 prototype to a production-grade embedded stack based on Qt6 C++, STM32F446 + FreeRTOS, Jetson Nano, and Eclipse Paho MQTT C++. The migration ensures that existing business logic, provisioning workflows, and cloud interactions remain perfectly consistent with the current implementation.

## 2. Platform Paradigm Shift

| Component | Prototype (Current) | Production (Target) |
| :--- | :--- | :--- |
| **Edge UI/Logic App** | Python, PyQt6, Raspberry Pi | Qt6 C++, QML, Jetson Nano / Orin Nano |
| **MQTT Client** | Paho MQTT Python | Eclipse Paho MQTT C++ |
| **Hardware Controller** | ESP32 (Simulated/Basic) | STM32F446 (FreeRTOS) |
| **Inter-Device Comms** | JSON over USB Serial | Binary Protocol over UART |
| **Cloud/Dashboard** | Existing Node.js Backend | *Unchanged* |

## 3. Scope of Migration

The objective is to rewrite the Edge software and Microcontroller firmware. The cloud dashboard and MQTT topics **must not be altered**.

### Preserved Features
- One-Time Provisioning Workflow (Announce -> Wait for Claim -> Save -> Normal Boot)
- Device Lifecycle (Boot -> Connect -> Login -> Shopping -> Checkout -> Done -> Loop)
- Shopping Workflow (Weight + OCR verification)
- Telemetry & MQTT interactions (Publish format, QoS, topics)

### Deprecated Features
- Direct UI handling via Python logic
- JSON over Serial

## 4. Phased Migration Strategy

### Phase 1: Architecture & Specifications (Current)
- Lock down the System Architecture, FreeRTOS tasks, Qt6 architecture, and UART protocol specifications.
- Deliverable: Approved documentation under `docs/architecture/`.

### Phase 2: Embedded Firmware (STM32)
- Initialize PlatformIO project for STM32F446.
- Set up FreeRTOS tasks (Weight, Battery, LED, Button, Buzzer, Watchdog, UART).
- Implement and test the UART binary protocol using a dummy PC client.

### Phase 3: Edge Core Engine (Qt6 C++)
- Initialize CMake project for Qt6.
- Integrate Eclipse Paho MQTT C++ via `FetchContent`.
- Implement core services (ProvisioningService, MqttService, UARTDriver, AppController).
- Port state machine logic and business rules from Python.

### Phase 4: Edge UI (QML)
- Recreate the PyQt6 UI components in Qt Quick/QML.
- Bind QML UI to C++ backend controllers and view models.
- Ensure strict separation of UI rendering and business logic.

### Phase 5: Integration & Validation
- Connect STM32 to Jetson over physical UART.
- End-to-end testing of the complete shopping flow (Weight trigger -> Hardware UART -> Jetson -> C++ Core -> UI -> MQTT -> Cloud).
- Verify One-Time Provisioning edge cases (factory resets, network failures).

## 5. Rollout Strategy
1. **Lab Testing:** Verify Jetson+STM32 combo against the staging cloud environment.
2. **Beta Deployment:** Deploy the new hardware iteration to a single cart in a live mall.
3. **Full Fleet Upgrade:** Gradually replace Raspberry Pi/ESP32 carts with the new Jetson/STM32 architecture.