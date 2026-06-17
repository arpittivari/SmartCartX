#ifndef CART_MODEL_H
#define CART_MODEL_H

#include <QAbstractListModel>
#include <QList>
#include "CartItem.h"

class CartModel : public QAbstractListModel {
    Q_OBJECT
    Q_PROPERTY(int totalQuantity READ totalQuantity NOTIFY cartChanged)
    Q_PROPERTY(double totalWeight READ totalWeight NOTIFY cartChanged)
    Q_PROPERTY(double totalPrice READ totalPrice NOTIFY cartChanged)

public:
    enum CartRoles {
        ProductRole = Qt::UserRole + 1,
        QuantityRole,
        TotalWeightRole,
        TotalPriceRole
    };

    explicit CartModel(QObject *parent = nullptr);
    ~CartModel() override;

    int rowCount(const QModelIndex &parent = QModelIndex()) const override;
    QVariant data(const QModelIndex &index, int role = Qt::DisplayRole) const override;
    QHash<int, QByteArray> roleNames() const override;

    Q_INVOKABLE void addItem(Product* product, int quantity = 1);
    Q_INVOKABLE void removeItem(const QString& sku);
    Q_INVOKABLE void updateQuantity(const QString& sku, int quantity);
    Q_INVOKABLE void clearCart();

    int totalQuantity() const;
    double totalWeight() const;
    double totalPrice() const;

signals:
    void cartChanged();

private:
    QList<CartItem*> m_items;
};

#endif
