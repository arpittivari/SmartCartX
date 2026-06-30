# Hardware Abstraction Layer (HAL)

This document describes the Phase 7A implementation of the Hardware Abstraction Layer (HAL) using Dependency Injection, which strictly decouples business logic from hardware implementations.

```mermaid
classDiagram
    class AppContext {
        +HardwareProviderFactory* hwFactory
    }

    class HardwareProviderFactory {
        +getWeightSensor() IWeightSensor*
        +getBatteryMonitor() IBatteryMonitor*
        +getCamera() ICamera*
        +getAudioPlayer() IAudioPlayer*
    }

    %% Interfaces
    class IWeightSensor {
        <<interface>>
        +weightChanged(int grams)
    }

    class IBatteryMonitor {
        <<interface>>
        +batteryLevelChanged(float pct)
    }

    class ICamera {
        <<interface>>
        +startCapture()
        +stopCapture()
        +frameReady(QImage)
    }

    %% Implementations
    class SimulatedWeightSensor
    class STM32WeightSensor
    
    class SimulatedBatteryMonitor
    class STM32BatteryMonitor

    class PcWebcamCamera
    class JetsonCamera

    IWeightSensor <|-- SimulatedWeightSensor
    IWeightSensor <|-- STM32WeightSensor

    IBatteryMonitor <|-- SimulatedBatteryMonitor
    IBatteryMonitor <|-- STM32BatteryMonitor

    ICamera <|-- PcWebcamCamera
    ICamera <|-- JetsonCamera

    AppContext --> HardwareProviderFactory
    HardwareProviderFactory ..> IWeightSensor
    HardwareProviderFactory ..> IBatteryMonitor
    HardwareProviderFactory ..> ICamera
```

## How to Swap Hardware (Example)
To swap from Simulator mode to full hardware mode, simply modify `AppContext::initialize` to pass `HardwareMode::PRODUCTION_STM32_JETSON` instead of `HardwareMode::SIMULATOR` when instantiating the `HardwareProviderFactory`. No business logic in `ShoppingService` or `TelemetryService` needs to change, as they rely entirely on the abstract interfaces returned by the factory.