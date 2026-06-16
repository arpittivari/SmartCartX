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
#include "../drivers/MockSensorProvider.h"

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
    MockSensorProvider* m_mockSensorProvider;
};

#endif