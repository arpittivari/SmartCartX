#ifndef MQTT_SERVICE_H
#define MQTT_SERVICE_H

#include <QObject>
#include <QString>
#include <QTimer>
#include <mqtt/async_client.h>
#include <memory>

class MqttService : public QObject, public virtual mqtt::callback, public virtual mqtt::iaction_listener {
    Q_OBJECT
public:
    explicit MqttService(QObject *parent = nullptr);
    virtual ~MqttService();

public slots:
    void connectToBroker(const QString& broker, int port, const QString& clientId, const QString& user = "", const QString& pass = "");
    void disconnectFromBroker();
    void publish(const QString& topic, const QString& payload, int qos = 1);
    void subscribe(const QString& topic, int qos = 1);
    
signals:
    void connected();
    void disconnected();
    void messageReceived(const QString& topic, const QString& payload);

private slots:
    void checkConnection();

private:
    // Paho callbacks
    void connection_lost(const std::string& cause) override;
    void message_arrived(mqtt::const_message_ptr msg) override;
    void delivery_complete(mqtt::delivery_token_ptr token) override;
    
    // Paho action listener callbacks
    void on_failure(const mqtt::token& tok) override;
    void on_success(const mqtt::token& tok) override;

    std::unique_ptr<mqtt::async_client> m_client;
    QString m_broker;
    int m_port;
    QString m_clientId;
    QString m_user;
    QString m_pass;
    bool m_isConnected;
    QTimer* m_reconnectTimer;
};

#endif