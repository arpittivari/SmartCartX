#include "ProductCatalog.h"

ProductCatalog::ProductCatalog(QObject *parent) : QObject(parent) {
    initializeMockCatalog();
}

void ProductCatalog::initializeMockCatalog() {
    m_products.append(new Product("p1", "SKU001", "Milk", "Dairy", 2.50, 1000.0, this));
    m_products.append(new Product("p2", "SKU002", "Bread", "Bakery", 1.80, 500.0, this));
    m_products.append(new Product("p3", "SKU003", "Rice", "Grains", 5.00, 2000.0, this));
    m_products.append(new Product("p4", "SKU004", "Soap", "Personal Care", 1.20, 150.0, this));
    m_products.append(new Product("p5", "SKU005", "Shampoo", "Personal Care", 4.50, 400.0, this));
    m_products.append(new Product("p6", "SKU006", "Biscuits", "Snacks", 2.00, 250.0, this));
    m_products.append(new Product("p7", "SKU007", "Cola", "Beverages", 1.50, 500.0, this));
    m_products.append(new Product("p8", "SKU008", "Vegetables", "Produce", 3.00, 1000.0, this));
}

QList<Product*> ProductCatalog::getAllProducts() const {
    return m_products;
}

Product* ProductCatalog::getProductBySku(const QString& sku) const {
    for (Product* product : m_products) {
        if (product->sku() == sku) {
            return product;
        }
    }
    return nullptr;
}
