#include "AppContext.h"
#include <QDebug>

AppContext::AppContext(QObject *parent) : QObject(parent) {
    m_configManager = new ConfigManager(this);
    m_stateManager = new StateManager(this);
    m_mqttService = new MqttService(this);
    
    // Pass MAC address mock, or fetch dynamically in production
    m_telemetryService = new TelemetryService(m_mqttService, "AA:BB:CC:DD:EE:FF", this);
    m_provisioningService = new ProvisioningService(m_mqttService, m_configManager, this);
    m_shoppingService = new ShoppingService(m_telemetryService, this);
    m_serialService = new SerialService("/dev/ttyUSB0", m_telemetryService, m_shoppingService, this);
    m_mockSensorProvider = new MockSensorProvider(m_telemetryService, m_shoppingService, this);

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
        m_mockSensorProvider->startMocking();
        
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