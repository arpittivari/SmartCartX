#ifndef CHECKOUT_SERVICE_H
#define CHECKOUT_SERVICE_H

#include <QObject>

class CheckoutService : public QObject {
    Q_OBJECT
public:
    explicit CheckoutService(QObject *parent = nullptr) : QObject(parent) {}
    virtual ~CheckoutService() = default;

public slots:
    virtual void requestCheckout() {}

signals:
    void checkoutUrlReceived(const QString& url);
    void paymentComplete();
};

#endif