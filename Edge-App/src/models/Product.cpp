#include "Product.h"

Product::Product(QObject *parent)
    : QObject(parent), m_price(0.0), m_weight(0.0) {}

Product::Product(const QString& id, const QString& sku, const QString& name, const QString& category, double price, double weight, QObject* parent)
    : QObject(parent), m_id(id), m_sku(sku), m_name(name), m_category(category), m_price(price), m_weight(weight) {}

Product::Product(const Product& other)
    : QObject(other.parent()), m_id(other.m_id), m_sku(other.m_sku), m_name(other.m_name), m_category(other.m_category), m_price(other.m_price), m_weight(other.m_weight) {}

Product& Product::operator=(const Product& other) {
    if (this != &other) {
        m_id = other.m_id;
        m_sku = other.m_sku;
        m_name = other.m_name;
        m_category = other.m_category;
        m_price = other.m_price;
        m_weight = other.m_weight;
    }
    return *this;
}

QString Product::id() const { return m_id; }
QString Product::sku() const { return m_sku; }
QString Product::name() const { return m_name; }
QString Product::category() const { return m_category; }
double Product::price() const { return m_price; }
double Product::weight() const { return m_weight; }
