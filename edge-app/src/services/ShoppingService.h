#ifndef SHOPPING_SERVICE_H
#define SHOPPING_SERVICE_H

#include <QObject>

#include "../models/ShoppingSession.h"
#include "../models/CustomerProfile.h"

#include "TelemetryService.h"

class ShoppingService : public QObject {
    Q_OBJECT
public:
    explicit ShoppingService(TelemetryService* telemetry, QObject *parent = nullptr);
    virtual ~ShoppingService() = default;

    ShoppingSession currentSession() const { return m_session; }

public slots:
    virtual void startSession(const CustomerProfile& customer);
    virtual void endSession();
    virtual void processWeightEvent(int grams) {}

private:
    TelemetryService* m_telemetry;
    ShoppingSession m_session;
};

#endif