#include "AppContext.h"
#include <QDebug>

AppContext::AppContext(QObject *parent) : QObject(parent) {
    m_configManager = new ConfigManager(this);
    m_stateManager = new StateManager(this);
    m_mqttService = new MqttService(this);
    
    m_telemetryService = new TelemetryService(m_mqttService, nullptr, "AA:BB:CC:DD:EE:FF", this); // Temporary to satisfy SerialService dependency
    m_serialService = new SerialService("/dev/ttyUSB0", m_telemetryService, this);
    
    // Choose mode (Mock for Milestone 1 or STM32 for Future production)
    // NOTE: For the Simulator milestone, we can actually just run PRODUCTION_STM32_JETSON and pipe simulator data to the serial parser!
    m_hwFactory = new HardwareProviderFactory(HardwareMode::PRODUCTION_STM32_JETSON, m_serialService, this);
    
    // Update Telemetry with actual BatteryMonitor
    m_telemetryService->setBatteryMonitor(m_hwFactory->getBatteryMonitor());
    m_provisioningService = new ProvisioningService(m_mqttService, m_configManager, this);
    m_shoppingService = new ShoppingService(m_telemetryService, m_hwFactory->getWeightSensor(), m_hwFactory->getBarcodeScanner(), m_hwFactory->getAudioPlayer(), this);
    
    m_stm32Simulator = new Stm32Simulator(m_serialService, this);
    m_debugController = new DebugController(m_stateManager, m_serialService, m_mqttService, this);

    connect(m_configManager, &ConfigManager::configChanged, this, &AppContext::onConfigChanged);
    connect(m_mqttService, &MqttService::connected, this, [this]() {
        if (m_configManager->isProvisioned()) {
            m_telemetryService->startTelemetry();
        }
    });
    connect(m_provisioningService, &ProvisioningService::provisioningComplete, this, [this]() {
        // Force the MQTT to disconnect and let the reboot handle the actual fresh start.
        m_mqttService->disconnectFromBroker();
    });
}

void AppContext::initialize() {
    qDebug() << "[AppContext] Initializing...";

    // 1. BOOT state actions (e.g. init hardware, read config)
    m_stateManager->checkDeviceConfiguration();

    // 2. Check Device Configuration
    if (m_configManager->isProvisioned()) {
        m_stateManager->handleConfigLoaded();
        m_telemetryService->updateState(CartState::ONLINE);
        
        m_serialService->openPort();
        m_stm32Simulator->startMocking();
        
        // Connect to MQTT with loaded credentials
        m_mqttService->connectToBroker(
            "broker.hivemq.com", // Example broker
            1883,
            m_configManager->getCartId(),
            m_configManager->getMqttUser(),
            m_configManager->getMqttPass()
        );
    } else {
        m_stateManager->handleConfigMissing();
        
        // In unprovisioned state, connect anonymously
        m_mqttService->connectToBroker(
            "broker.hivemq.com",
            1883,
            "pi_UNPROVISIONED"
        );
        m_provisioningService->startProvisioning();
    }
}

void AppContext::onConfigChanged() {
    // Called when provisioning completes and saves config, or factory reset
    if (m_configManager->isProvisioned()) {
        m_stateManager->handleApprovalReceived(); 
        // Flow moves to BOOT (which acts as Reboot locally)
    }
}