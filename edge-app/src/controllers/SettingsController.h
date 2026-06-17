#ifndef SETTINGS_CONTROLLER_H
#define SETTINGS_CONTROLLER_H

#include <QObject>
#include <QString>
#include "../core/ConfigManager.h"

class SettingsController : public QObject {
    Q_OBJECT
    Q_PROPERTY(QString cartId READ cartId NOTIFY settingsChanged)
    Q_PROPERTY(QString mallId READ mallId NOTIFY settingsChanged)
    Q_PROPERTY(QString mqttBroker READ mqttBroker NOTIFY settingsChanged)
    Q_PROPERTY(bool developerMode READ developerMode WRITE setDeveloperMode NOTIFY developerModeChanged)

public:
    explicit SettingsController(ConfigManager* config, QObject* parent = nullptr);

    QString cartId() const;
    QString mallId() const;
    QString mqttBroker() const;
    bool developerMode() const { return m_developerMode; }
    void setDeveloperMode(bool mode);

public slots:
    void factoryReset();

signals:
    void settingsChanged();
    void developerModeChanged();

private:
    ConfigManager* m_config;
    bool m_developerMode = false;
};

#endif
