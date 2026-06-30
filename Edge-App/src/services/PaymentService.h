#ifndef PAYMENT_SERVICE_H
#define PAYMENT_SERVICE_H

#include <QObject>
#include <QTimer>
#include "TelemetryService.h"

class PaymentService : public QObject {
    Q_OBJECT
public:
    explicit PaymentService(TelemetryService* telemetryService, QObject *parent = nullptr);

public slots:
    void processPayment();

signals:
    void paymentSuccess();

private:
    TelemetryService* m_telemetryService;
};

#endif
