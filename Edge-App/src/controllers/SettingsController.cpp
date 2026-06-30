#include "SettingsController.h"

SettingsController::SettingsController(ConfigManager* config, QObject* parent)
    : QObject(parent), m_config(config)
{
    connect(m_config, &ConfigManager::configChanged, this, &SettingsController::settingsChanged);
}

QString SettingsController::cartId() const {
    return m_config ? m_config->getCartId() : "";
}

QString SettingsController::mallId() const {
    return m_config ? m_config->getMallId() : "";
}

void SettingsController::setDeveloperMode(bool mode) {
    if (m_developerMode != mode) {
        m_developerMode = mode;
        emit developerModeChanged();
    }
}

void SettingsController::factoryReset() {
    if (m_config) {
        m_config->factoryReset();
    }
}
