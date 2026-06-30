#include "ConfigManager.h"
#include <QStandardPaths>
#include <QDir>
#include <QDebug>

ConfigManager::ConfigManager(QObject *parent)
    : QObject(parent), 
      // Store in AppConfigLocation (~/.config/SmartCartEdgeApp/cart_config.ini)
      m_settings(QStandardPaths::writableLocation(QStandardPaths::AppConfigLocation) + "/cart_config.ini", QSettings::IniFormat)
{
    // Ensure directory exists
    QDir dir(QStandardPaths::writableLocation(QStandardPaths::AppConfigLocation));
    if (!dir.exists()) {
        dir.mkpath(".");
    }
}

bool ConfigManager::loadConfig() {
    qDebug() << "[ConfigManager] Loading config from" << m_settings.fileName();
    return isProvisioned();
}

bool ConfigManager::saveConfig(const QVariantMap& configData) {
    m_settings.beginGroup("SMARTCART");
    m_settings.setValue("mallId", configData.value("mallId"));
    m_settings.setValue("cartId", configData.value("cartId"));
    m_settings.setValue("mqttUser", configData.value("mqttUser"));
    m_settings.setValue("mqttPass", configData.value("mqttPass"));
    m_settings.setValue("isProvisioned", true);
    m_settings.endGroup();
    m_settings.sync();
    
    qDebug() << "[ConfigManager] Configuration saved.";
    emit configChanged();
    return true;
}

bool ConfigManager::isProvisioned() const {
    return m_settings.value("SMARTCART/isProvisioned", false).toBool();
}

QString ConfigManager::getMallId() const {
    return m_settings.value("SMARTCART/mallId", "").toString();
}

QString ConfigManager::getCartId() const {
    return m_settings.value("SMARTCART/cartId", "").toString();
}

QString ConfigManager::getMqttUser() const {
    return m_settings.value("SMARTCART/mqttUser", "").toString();
}

QString ConfigManager::getMqttPass() const {
    return m_settings.value("SMARTCART/mqttPass", "").toString();
}

void ConfigManager::factoryReset() {
    qDebug() << "[ConfigManager] Performing factory reset.";
    m_settings.clear();
    m_settings.sync();
    emit configChanged();
}