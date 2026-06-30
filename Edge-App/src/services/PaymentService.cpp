#include "PaymentService.h"
#include <QDebug>

PaymentService::PaymentService(TelemetryService* telemetryService, QObject *parent)
    : QObject(parent), m_telemetryService(telemetryService) {}

void PaymentService::processPayment() {
    qDebug() << "[PaymentService] Processing payment...";

    QTimer::singleShot(2000, this, [this]() {
        qDebug() << "[PaymentService] Payment successful.";

        if (m_telemetryService) {
            m_telemetryService->publishPaymentSuccess();
        }
        emit paymentSuccess();
    });
}
