#include "HardwareProviderFactory.h"

// Simulators
#include "../drivers/simulated/SimulatedWeightSensor.h"
#include "../drivers/simulated/SimulatedBatteryMonitor.h"
#include "../drivers/simulated/SimulatedButtonInput.h"
#include "../drivers/simulated/MockBarcodeScanner.h"
#include "../drivers/pc/PcWebcamCamera.h"
#include "../drivers/pc/QtAudioPlayer.h"

// Production Stubs
#include "../drivers/stm32/STM32WeightSensor.h"
#include "../drivers/stm32/STM32BatteryMonitor.h"
#include "../drivers/stm32/STM32ButtonInput.h"
#include "../drivers/jetson/JetsonCamera.h"
#include "../drivers/usb/UsbBarcodeScanner.h"

HardwareProviderFactory::HardwareProviderFactory(HardwareMode mode, SerialService* serialService, QObject* parent)
    : QObject(parent), 
      m_weightSensor(nullptr), 
      m_batteryMonitor(nullptr), 
      m_buttonInput(nullptr), 
      m_camera(nullptr), 
      m_audioPlayer(nullptr), 
      m_barcodeScanner(nullptr),
      m_serialService(serialService)
{
    if (mode == HardwareMode::SIMULATOR) {
        initializeSimulatorProviders();
    } else {
        initializeProductionProviders();
    }
}

void HardwareProviderFactory::initializeSimulatorProviders() {
    auto weightSensor = new SimulatedWeightSensor(this);
    weightSensor->startMocking();
    m_weightSensor = weightSensor;

    auto batteryMonitor = new SimulatedBatteryMonitor(this);
    batteryMonitor->startMocking();
    m_batteryMonitor = batteryMonitor;

    auto buttonInput = new SimulatedButtonInput(this);
    buttonInput->startMocking();
    m_buttonInput = buttonInput;

    m_camera = new PcWebcamCamera(this);
    m_audioPlayer = new QtAudioPlayer(this);
    
    auto barcodeScanner = new MockBarcodeScanner(this);
    barcodeScanner->startMocking();
    m_barcodeScanner = barcodeScanner;
}

void HardwareProviderFactory::initializeProductionProviders() {
    m_weightSensor = new STM32WeightSensor(m_serialService, this);
    m_batteryMonitor = new STM32BatteryMonitor(m_serialService, this);
    m_buttonInput = new STM32ButtonInput(m_serialService, this);
    
    m_camera = new JetsonCamera(this);
    m_audioPlayer = new QtAudioPlayer(this); // Using standard Qt Audio regardless
    m_barcodeScanner = new UsbBarcodeScanner(this);
}