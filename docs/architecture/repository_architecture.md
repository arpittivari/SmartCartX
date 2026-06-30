# Repository Architecture

This document describes the structure of the production repository. The repository isolates hardware firmware from edge application software while sharing necessary protocol definitions.

## Top-Level Directory Structure

```text
SmartCart/
├── docs/                      # Architecture, protocol specs, and developer guides
│   └── architecture/          # Architecture documentation
├── edge-app/                  # Qt6 C++ & QML Jetson Application
├── firmware/                  # PlatformIO STM32 FreeRTOS Project
├── protocols/                 # Shared binary definitions (e.g., C headers for UART)
├── hardware/                  # PCB design files, schematics, and mechanical assets
├── tests/                     # Integration test scripts
└── deployment/                # Scripts for Jetson provisioning, OTA updates, systemd services
```

## `edge-app` (Qt6 Jetson App)

```text
edge-app/
├── CMakeLists.txt             # Primary build configuration (fetches Paho MQTT, configures Qt6)
├── assets/                    # Images, fonts, and local databases (products.csv)
├── src/
│   ├── core/                  # AppController, StateMachine, AppContext
│   ├── drivers/               # UARTDriver, CameraDriver
│   ├── services/              # ProvisioningService, MqttService, ShoppingService, ValidationService, TelemetryService
│   ├── models/                # C++ Data models (CartItem, Product, etc.)
│   ├── state_machine/         # QStateMachine or custom FSM implementation classes
│   └── ui/                    # C++ ViewModels exposing data to QML
├── qml/                       # QML UI Files (main.qml, views, components)
├── config/                    # Default configurations
└── tests/                     # GoogleTest or QtTest suites
```

## `firmware` (STM32)

```text
firmware/
├── platformio.ini             # PlatformIO config for STM32F446 (and future STM32H7)
├── include/                   # Global header files
├── src/
│   ├── main.cpp               # FreeRTOS setup and task initialization
│   ├── app/                   # App layer definitions
│   ├── tasks/                 # FreeRTOS task definitions (UartTask, WeightTask, BatteryTask, etc.)
│   ├── drivers/               # Hardware abstraction (HX711, ADC, GPIO, PWM)
│   ├── protocol/              # UART packet parsers and builders
│   ├── services/              # Internal firmware services
│   └── utils/                 # CRC16 calculators, buffer management
├── lib/                       # External libraries
└── test/                      # Unity tests for firmware
```

## `protocols` (Shared)

```text
protocols/
├── uart_messages.h            # C structs defining the binary payload over UART
├── constants.h                # Shared enums (Command IDs, Error Codes)
└── scripts/                   # Generators (if needed) to create Python/Node parsers for testing
```