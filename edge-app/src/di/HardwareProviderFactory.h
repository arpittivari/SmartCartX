#ifndef HARDWARE_PROVIDER_FACTORY_H
#define HARDWARE_PROVIDER_FACTORY_H

#include <QObject>

#include "../drivers/interfaces/IWeightSensor.h"
#include "../drivers/interfaces/IBatteryMonitor.h"
#include "../drivers/interfaces/IButtonInput.h"
#include "../drivers/interfaces/ICamera.h"
#include "../drivers/interfaces/IAudioPlayer.h"
#include "../drivers/interfaces/IBarcodeScanner.h"
#include "../services/SerialService.h"

enum class HardwareMode {
    SIMULATOR,
    PRODUCTION_STM32_JETSON
};

class HardwareProviderFactory : public QObject {
    Q_OBJECT
public:
    explicit HardwareProviderFactory(HardwareMode mode, SerialService* serialService, QObject* parent = nullptr);
    virtual ~HardwareProviderFactory() = default;

    IWeightSensor* getWeightSensor() const { return m_weightSensor; }
    IBatteryMonitor* getBatteryMonitor() const { return m_batteryMonitor; }
    IButtonInput* getButtonInput() const { return m_buttonInput; }
    ICamera* getCamera() const { return m_camera; }
    IAudioPlayer* getAudioPlayer() const { return m_audioPlayer; }
    IBarcodeScanner* getBarcodeScanner() const { return m_barcodeScanner; }

private:
    void initializeSimulatorProviders();
    void initializeProductionProviders();

    IWeightSensor* m_weightSensor;
    IBatteryMonitor* m_batteryMonitor;
    IButtonInput* m_buttonInput;
    ICamera* m_camera;
    IAudioPlayer* m_audioPlayer;
    IBarcodeScanner* m_barcodeScanner;
    SerialService* m_serialService;
};

#endif