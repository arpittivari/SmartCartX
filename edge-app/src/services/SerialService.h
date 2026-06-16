#ifndef SERIAL_SERVICE_H
#define SERIAL_SERVICE_H

#include <QObject>
#include <QSerialPort>
#include <QTimer>
#include "../../protocols/include/packet.hpp"
#include "TelemetryService.h"
#include "ShoppingService.h"

class SerialService : public QObject {
    Q_OBJECT
public:
    explicit SerialService(const QString& portName, TelemetryService* telemetry, ShoppingService* shopping, QObject *parent = nullptr);
    virtual ~SerialService();

public slots:
    void openPort();
    void closePort();
    bool sendPacket(SmartCart::Protocol::Command cmd, const uint8_t* payload, uint8_t payloadLen);

signals:
    void portOpened();
    void portClosed();
    void portError(const QString& errorMsg);
    void packetReceived(SmartCart::Protocol::Command cmd, const uint8_t* payload, uint8_t payloadLen);

private slots:
    void onReadyRead();
    void handleError(QSerialPort::SerialPortError error);
    void checkConnection();

private:
    QSerialPort* m_serial;
    QString m_portName;
    QTimer* m_reconnectTimer;
    SmartCart::Protocol::PacketParser m_parser;
    bool m_isConnected;
    TelemetryService* m_telemetry;
    ShoppingService* m_shopping;
};

#endif