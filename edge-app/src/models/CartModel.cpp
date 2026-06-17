#include "CartModel.h"
#include <QDebug>

CartModel::CartModel(QObject *parent) : QAbstractListModel(parent) {}

CartModel::~CartModel() {
    clearCart();
}

int CartModel::rowCount(const QModelIndex &parent) const {
    Q_UNUSED(parent)
    return m_items.count();
}

QVariant CartModel::data(const QModelIndex &index, int role) const {
    if (index.row() < 0 || index.row() >= m_items.count()) return QVariant();

    CartItem* item = m_items[index.row()];
    switch (role) {
        case ProductRole: return QVariant::fromValue(item->product());
        case QuantityRole: return item->quantity();
        case TotalWeightRole: return item->totalWeight();
        case TotalPriceRole: return item->totalPrice();
    }
    return QVariant();
}

QHash<int, QByteArray> CartModel::roleNames() const {
    QHash<int, QByteArray> roles;
    roles[ProductRole] = "product";
    roles[QuantityRole] = "quantity";
    roles[TotalWeightRole] = "totalWeight";
    roles[TotalPriceRole] = "totalPrice";
    return roles;
}

void CartModel::addItem(Product* product, int quantity) {
    if (!product) return;

    for (int i = 0; i < m_items.size(); ++i) {
        if (m_items[i]->product()->sku() == product->sku()) {
            m_items[i]->setQuantity(m_items[i]->quantity() + quantity);
            QModelIndex idx = createIndex(i, 0);
            emit dataChanged(idx, idx, {QuantityRole, TotalWeightRole, TotalPriceRole});
            emit cartChanged();
            return;
        }
    }

    beginInsertRows(QModelIndex(), m_items.size(), m_items.size());
    m_items.append(new CartItem(product, quantity, this));
    endInsertRows();
    emit cartChanged();
}

void CartModel::removeItem(const QString& sku) {
    for (int i = 0; i < m_items.size(); ++i) {
        if (m_items[i]->product()->sku() == sku) {
            beginRemoveRows(QModelIndex(), i, i);
            CartItem* item = m_items.takeAt(i);
            delete item;
            endRemoveRows();
            emit cartChanged();
            return;
        }
    }
}

void CartModel::updateQuantity(const QString& sku, int quantity) {
    if (quantity <= 0) {
        removeItem(sku);
        return;
    }
    for (int i = 0; i < m_items.size(); ++i) {
        if (m_items[i]->product()->sku() == sku) {
            m_items[i]->setQuantity(quantity);
            QModelIndex idx = createIndex(i, 0);
            emit dataChanged(idx, idx, {QuantityRole, TotalWeightRole, TotalPriceRole});
            emit cartChanged();
            return;
        }
    }
}

void CartModel::clearCart() {
    beginResetModel();
    qDeleteAll(m_items);
    m_items.clear();
    endResetModel();
    emit cartChanged();
}

int CartModel::totalQuantity() const {
    int total = 0;
    for (const auto* item : m_items) {
        total += item->quantity();
    }
    return total;
}

double CartModel::totalWeight() const {
    double total = 0.0;
    for (const auto* item : m_items) {
        total += item->totalWeight();
    }
    return total;
}

double CartModel::totalPrice() const {
    double total = 0.0;
    for (const auto* item : m_items) {
        total += item->totalPrice();
    }
    return total;
}
