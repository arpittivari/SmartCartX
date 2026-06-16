#include "MqttService.h"
#include <QDebug>

MqttService::MqttService(QObject *parent)
    : QObject(parent), m_isConnected(false)
{
    m_reconnectTimer = new QTimer(this);
    m_reconnectTimer->setInterval(5000);
    connect(m_reconnectTimer, &QTimer::timeout, this, &MqttService::checkConnection);
}

MqttService::~MqttService() {
    disconnectFromBroker();
}

void MqttService::connectToBroker(const QString& broker, int port, const QString& clientId, const QString& user, const QString& pass) {
    m_broker = broker;
    m_port = port;
    m_clientId = clientId;
    m_user = user;
    m_pass = pass;
    
    QString serverUri = QString("tcp://%1:%2").arg(broker).arg(port);
    qDebug() << "[MqttService] Connecting to" << serverUri << "as" << clientId;
    
    try {
        m_client = std::make_unique<mqtt::async_client>(serverUri.toStdString(), clientId.toStdString());
        m_client->set_callback(*this);
        
        mqtt::connect_options connOpts;
        connOpts.set_keep_alive_interval(20);
        connOpts.set_clean_session(true);
        connOpts.set_automatic_reconnect(true); // Let paho handle reconnect where possible
        
        if (!user.isEmpty()) {
            connOpts.set_user_name(user.toStdString());
            connOpts.set_password(pass.toStdString());
        }
        
        m_client->connect(connOpts, nullptr, *this);
    } catch (const mqtt::exception& exc) {
        qWarning() << "[MqttService] Connection Exception:" << exc.what();
        m_reconnectTimer->start();
    }
}

void MqttService::disconnectFromBroker() {
    qDebug() << "[MqttService] Disconnecting";
    m_isConnected = false;
    m_reconnectTimer->stop();
    
    if (m_client && m_client->is_connected()) {
        m_client->disconnect();
    }
    emit disconnected();
}

void MqttService::publish(const QString& topic, const QString& payload, int qos) {
    if (!m_isConnected || !m_client) return;
    qDebug() << "[MqttService] Publish -> Topic:" << topic << "Payload:" << payload;
    
    try {
        mqtt::message_ptr pubmsg = mqtt::make_message(topic.toStdString(), payload.toStdString());
        pubmsg->set_qos(qos);
        m_client->publish(pubmsg);
    } catch (const mqtt::exception& exc) {
        qWarning() << "[MqttService] Publish Exception:" << exc.what();
    }
}

void MqttService::subscribe(const QString& topic, int qos) {
    if (!m_isConnected || !m_client) return;
    qDebug() << "[MqttService] Subscribe -> Topic:" << topic;
    
    try {
        m_client->subscribe(topic.toStdString(), qos);
    } catch (const mqtt::exception& exc) {
        qWarning() << "[MqttService] Subscribe Exception:" << exc.what();
    }
}

void MqttService::checkConnection() {
    if (!m_isConnected) {
        connectToBroker(m_broker, m_port, m_clientId, m_user, m_pass);
    }
}

// Paho Callback implementations
void MqttService::connection_lost(const std::string& cause) {
    qWarning() << "[MqttService] Connection lost:" << QString::fromStdString(cause);
    m_isConnected = false;
    emit disconnected();
    m_reconnectTimer->start();
}

void MqttService::message_arrived(mqtt::const_message_ptr msg) {
    QString topic = QString::fromStdString(msg->get_topic());
    QString payload = QString::fromStdString(msg->to_string());
    // Safe cross-thread emit to QML/Controllers via QueuedConnection automatically
    emit messageReceived(topic, payload); 
}

void MqttService::delivery_complete(mqtt::delivery_token_ptr token) {
    // Optional delivery tracking
}

void MqttService::on_failure(const mqtt::token& tok) {
    qWarning() << "[MqttService] Connection or Action Failed.";
    m_isConnected = false;
    emit disconnected();
    m_reconnectTimer->start();
}

void MqttService::on_success(const mqtt::token& tok) {
    qDebug() << "[MqttService] Connection Success!";
    m_isConnected = true;
    m_reconnectTimer->stop();
    emit connected();
}