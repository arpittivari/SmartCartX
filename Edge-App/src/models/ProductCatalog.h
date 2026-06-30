#ifndef PRODUCT_CATALOG_H
#define PRODUCT_CATALOG_H

#include <QObject>
#include <QList>
#include <QString>
#include "Product.h"

class ProductCatalog : public QObject {
    Q_OBJECT
public:
    explicit ProductCatalog(QObject *parent = nullptr);
    virtual ~ProductCatalog() = default;

    Q_INVOKABLE QList<Product*> getAllProducts() const;
    Q_INVOKABLE Product* getProductBySku(const QString& sku) const;

private:
    void initializeMockCatalog();
    QList<Product*> m_products;
};

#endif
