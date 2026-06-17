#ifndef CONFIG_MANAGER_H
#define CONFIG_MANAGER_H

#include <QObject>
#include <QString>
#include <QSettings>
#include <QVariantMap>

class ConfigManager : public QObject {
    Q_OBJECT
    Q_PROPERTY(bool isProvisioned READ isProvisioned NOTIFY configChanged)

public:
    explicit ConfigManager(QObject *parent = nullptr);
    virtual ~ConfigManager() = default;

    bool loadConfig();
    bool saveConfig(const QVariantMap& configData);
    bool isProvisioned() const;

    QString getMallId() const;
    QString getCartId() const;
    QString getMqttUser() const;
    QString getMqttPass() const;
    QString getMqttBroker() const;
    int getMqttPort() const;

    void factoryReset();

signals:
    void configChanged();

private:
    QSettings m_settings;
};

#endif