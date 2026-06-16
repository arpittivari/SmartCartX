#include "SerialService.h"
#include <QDebug>

SerialService::SerialService(const QString& portName, TelemetryService* telemetry, ShoppingService* shopping, QObject *parent)
    : QObject(parent), m_portName(portName), m_isConnected(false), m_telemetry(telemetry), m_shopping(shopping)
{
    m_serial = new QSerialPort(this);
    m_serial->setPortName(m_portName);
    m_serial->setBaudRate(QSerialPort::Baud115200);
    m_serial->setDataBits(QSerialPort::Data8);
    m_serial->setParity(QSerialPort::NoParity);
    m_serial->setStopBits(QSerialPort::OneStop);
    m_serial->setFlowControl(QSerialPort::NoFlowControl);

    connect(m_serial, &QSerialPort::readyRead, this, &SerialService::onReadyRead);
    connect(m_serial, &QSerialPort::errorOccurred, this, &SerialService::handleError);

    m_reconnectTimer = new QTimer(this);
    m_reconnectTimer->setInterval(2000);
    connect(m_reconnectTimer, &QTimer::timeout, this, &SerialService::checkConnection);
}

SerialService::~SerialService() {
    closePort();
}

void SerialService::openPort() {
    if (!m_serial->isOpen()) {
        if (m_serial->open(QIODevice::ReadWrite)) {
            m_isConnected = true;
            m_reconnectTimer->stop();
            qDebug() << "[SerialService] Port opened:" << m_portName;
            emit portOpened();
        } else {
            qWarning() << "[SerialService] Failed to open port:" << m_portName << m_serial->errorString();
            m_isConnected = false;
            m_reconnectTimer->start();
            emit portError(m_serial->errorString());
        }
    }
}

void SerialService::closePort() {
    if (m_serial->isOpen()) {
        m_serial->close();
        m_isConnected = false;
        qDebug() << "[SerialService] Port closed:" << m_portName;
        emit portClosed();
    }
    m_reconnectTimer->stop();
}

bool SerialService::sendPacket(SmartCart::Protocol::Command cmd, const uint8_t* payload, uint8_t payloadLen) {
    if (!m_serial->isOpen()) return false;

    uint8_t buffer[256];
    size_t len = SmartCart::Protocol::PacketBuilder::build(cmd, payload, payloadLen, buffer, sizeof(buffer));
    
    if (len > 0) {
        qint64 written = m_serial->write(reinterpret_cast<const char*>(buffer), len);
        return written == static_cast<qint64>(len);
    }
    return false;
}

void SerialService::onReadyRead() {
    QByteArray data = m_serial->readAll();
    m_parser.feed(reinterpret_cast<const uint8_t*>(data.constData()), data.size());

    while (m_parser.hasPacket()) {
        auto cmd = m_parser.getCommand();
        const uint8_t* payload = m_parser.getPayload();
        
        emit packetReceived(cmd, payload, m_parser.getPayloadLength());
        
        if (cmd == SmartCart::Protocol::Command::CMD_BATTERY_TELEMETRY && m_telemetry) {
            const auto* bp = reinterpret_cast<const SmartCart::Protocol::BatteryPayload*>(payload);
            m_telemetry->updateBattery(static_cast<float>(bp->state_of_charge_pct));
        }
        else if (cmd == SmartCart::Protocol::Command::CMD_HEARTBEAT && m_telemetry) {
            m_telemetry->publishHeartbeat();
        }
        else if (cmd == SmartCart::Protocol::Command::CMD_WEIGHT_TELEMETRY && m_shopping) {
            const auto* wp = reinterpret_cast<const SmartCart::Protocol::WeightPayload*>(payload);
            m_shopping->processWeightEvent(wp->weight_grams);
        }
        
        m_parser.consumePacket();
    }
}

void SerialService::handleError(QSerialPort::SerialPortError error) {
    if (error == QSerialPort::ResourceError || error == QSerialPort::DeviceNotFoundError) {
        qWarning() << "[SerialService] Critical serial error:" << m_serial->errorString();
        closePort();
        m_reconnectTimer->start();
    }
}

void SerialService::checkConnection() {
    if (!m_isConnected) {
        openPort();
    }
}