#ifndef CART_ITEM_H
#define CART_ITEM_H

#include <QObject>
#include "Product.h"

class CartItem : public QObject {
    Q_OBJECT
    Q_PROPERTY(Product* product READ product CONSTANT)
    Q_PROPERTY(int quantity READ quantity WRITE setQuantity NOTIFY quantityChanged)
    Q_PROPERTY(double totalWeight READ totalWeight NOTIFY totalWeightChanged)
    Q_PROPERTY(double totalPrice READ totalPrice NOTIFY totalPriceChanged)

public:
    explicit CartItem(Product* product = nullptr, int quantity = 1, QObject* parent = nullptr);

    Product* product() const;
    int quantity() const;
    void setQuantity(int quantity);

    double totalWeight() const;
    double totalPrice() const;

signals:
    void quantityChanged();
    void totalWeightChanged();
    void totalPriceChanged();

private:
    Product* m_product;
    int m_quantity;
};

#endif
