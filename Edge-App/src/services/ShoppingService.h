#ifndef SHOPPING_SERVICE_H
#define SHOPPING_SERVICE_H

#include <QObject>

#include "../models/ShoppingSession.h"
#include "../models/CustomerProfile.h"
#include "../models/CartModel.h"
#include "../models/ProductCatalog.h"

#include "TelemetryService.h"
#include "../drivers/interfaces/IWeightSensor.h"
#include "../drivers/interfaces/IBarcodeScanner.h"
#include "../drivers/interfaces/IAudioPlayer.h"

class ShoppingService : public QObject {
    Q_OBJECT
    Q_PROPERTY(CartModel* cart READ cart CONSTANT)
    Q_PROPERTY(ProductCatalog* catalog READ catalog CONSTANT)
    Q_PROPERTY(bool isActive READ isActive NOTIFY activeChanged)

public:
    explicit ShoppingService(TelemetryService* telemetry, IWeightSensor* weightSensor, IBarcodeScanner* scanner, IAudioPlayer* audio, QObject *parent = nullptr);
    // Isse QML mein call kar payenge
    Q_INVOKABLE void clearCart();
    Q_INVOKABLE void generateAndSendReceipt(const QString& customerEmail);
    ShoppingSession currentSession() const { return m_session; }
    CartModel* cart() const { return m_cart; }
    ProductCatalog* catalog() const { return m_catalog; }
    bool isActive() const { return m_isActive; }

public slots:
    virtual void startSession(const CustomerProfile& customer);
    virtual void endSession();

    // QML Callable Cart management
    Q_INVOKABLE void addItem(const QString& sku);
    Q_INVOKABLE void removeItem(const QString& sku);
    Q_INVOKABLE void updateQuantity(const QString& sku, int quantity);

signals:
    void activeChanged();

private slots:
    void onWeightChanged(int grams);
    void onBarcodeScanned(const QString& data);
    void onCartUpdated();

private:
    TelemetryService* m_telemetry;
    IWeightSensor* m_weightSensor;
    IBarcodeScanner* m_scanner;
    IAudioPlayer* m_audio;
    ShoppingSession m_session;

    CartModel* m_cart;
    ProductCatalog* m_catalog;
    bool m_isActive = false;
};

#endif
