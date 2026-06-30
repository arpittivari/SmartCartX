#include "ReceiptGenerator.h"
#include <QFile>
#include <QJsonDocument>
#include <QDir>
#include <QDateTime>
#include <QDebug>
#include "TelemetryService.h"
#include "../core/AppContext.h"

ReceiptGenerator::ReceiptGenerator(QObject *parent) : QObject(parent) {
    QDir().mkpath("receipts");
}

void ReceiptGenerator::generateReceipt(const Receipt& receipt) {
    QString filename = QString("receipts/receipt_%1.json").arg(QDateTime::currentDateTime().toString("yyyyMMdd_HHmmss"));
    QFile file(filename);
    if (file.open(QIODevice::WriteOnly)) {
        QJsonDocument doc(receipt.toJson());
        file.write(doc.toJson());
        file.close();
        qDebug() << "[ReceiptGenerator] Receipt generated:" << filename;

        if (AppContext* ctx = qobject_cast<AppContext*>(parent())) {
            if (ctx->telemetryService()) {
                ctx->telemetryService()->publishReceiptGenerated();
            }
        }
    } else {
        qWarning() << "[ReceiptGenerator] Failed to open file for writing receipt:" << filename;
    }
}
