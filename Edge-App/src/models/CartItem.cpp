#include "CartItem.h"

CartItem::CartItem(Product* product, int quantity, QObject* parent)
    : QObject(parent), m_product(product), m_quantity(quantity)
{
    if (m_product) {
        m_product->setParent(this);
    }
}

Product* CartItem::product() const { return m_product; }
int CartItem::quantity() const { return m_quantity; }

void CartItem::setQuantity(int quantity) {
    if (m_quantity != quantity) {
        m_quantity = quantity;
        emit quantityChanged();
        emit totalWeightChanged();
        emit totalPriceChanged();
    }
}

double CartItem::totalWeight() const {
    if (m_product) return m_product->weight() * m_quantity;
    return 0.0;
}

double CartItem::totalPrice() const {
    if (m_product) return m_product->price() * m_quantity;
    return 0.0;
}
