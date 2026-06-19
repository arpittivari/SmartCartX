#ifndef APP_CONTEXT_H
#define APP_CONTEXT_H

#include <QObject>
#include "ConfigManager.h"
#include "../controllers/StateManager.h"
#include "../services/MqttService.h"
#include "../services/ProvisioningService.h"
#include "../services/TelemetryService.h"
#include "../services/ShoppingService.h"
#include "../services/SerialService.h"
#include "../drivers/Stm32Simulator.h"
#include "../controllers/DebugController.h"
#include "../controllers/SettingsController.h"
#include "../di/HardwareProviderFactory.h"

class AppContext : public QObject {
    Q_OBJECT
public:
    explicit AppContext(QObject *parent = nullptr);
    virtual ~AppContext() = default;

    void initialize();

    ConfigManager* configManager() { return m_configManager; }
    StateManager* stateManager() { return m_stateManager; }
    MqttService* mqttService() { return m_mqttService; }
    ProvisioningService* provisioningService() { return m_provisioningService; }
    TelemetryService* telemetryService() { return m_telemetryService; }
    ShoppingService* shoppingService() { return m_shoppingService; }
    SerialService* serialService() { return m_serialService; }
    DebugController* debugController() { return m_debugController; }
    SettingsController* settingsController() { return m_settingsController; }

private slots:
    void onConfigChanged();

private:
    ConfigManager* m_configManager;
    StateManager* m_stateManager;
    MqttService* m_mqttService;
    ProvisioningService* m_provisioningService;
    TelemetryService* m_telemetryService;
    ShoppingService* m_shoppingService;
    SerialService* m_serialService;
    Stm32Simulator* m_stm32Simulator;
    DebugController* m_debugController;
    HardwareProviderFactory* m_hwFactory;
    SettingsController* m_settingsController;
};

#endif
