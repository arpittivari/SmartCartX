#ifndef SHOPPING_SERVICE_H
#define SHOPPING_SERVICE_H

#include <QObject>

#include "../models/ShoppingSession.h"
#include "../models/CustomerProfile.h"

#include "TelemetryService.h"
#include "../drivers/interfaces/IWeightSensor.h"
#include "../drivers/interfaces/IBarcodeScanner.h"
#include "../drivers/interfaces/IAudioPlayer.h"

class ShoppingService : public QObject {
    Q_OBJECT
public:
    explicit ShoppingService(TelemetryService* telemetry, IWeightSensor* weightSensor, IBarcodeScanner* scanner, IAudioPlayer* audio, QObject *parent = nullptr);
    virtual ~ShoppingService() = default;

    ShoppingSession currentSession() const { return m_session; }

public slots:
    virtual void startSession(const CustomerProfile& customer);
    virtual void endSession();

private slots:
    void onWeightChanged(int grams);
    void onBarcodeScanned(const QString& data);

private:
    TelemetryService* m_telemetry;
    IWeightSensor* m_weightSensor;
    IBarcodeScanner* m_scanner;
    IAudioPlayer* m_audio;
    ShoppingSession m_session;
};

#endif