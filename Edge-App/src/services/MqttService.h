#ifndef MQTT_SERVICE_H
#define MQTT_SERVICE_H

#include <QObject>
#include <QString>

class MqttService : public QObject {
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
    void mqttConnected();
    void disconnected();
    void messageReceived(const QString& topic, const QString& payload);

private:
    bool m_isConnected;
};

#endif