#ifndef PRODUCT_H
#define PRODUCT_H

#include <QObject>
#include <QString>

class Product : public QObject {
    Q_OBJECT
    Q_PROPERTY(QString id READ id CONSTANT)
    Q_PROPERTY(QString sku READ sku CONSTANT)
    Q_PROPERTY(QString name READ name CONSTANT)
    Q_PROPERTY(QString category READ category CONSTANT)
    Q_PROPERTY(double price READ price CONSTANT)
    Q_PROPERTY(double weight READ weight CONSTANT)

public:
    explicit Product(QObject *parent = nullptr);
    Product(const QString& id, const QString& sku, const QString& name, const QString& category, double price, double weight, QObject* parent = nullptr);
    Product(const Product& other);
    Product& operator=(const Product& other);
    ~Product() = default;

    QString id() const;
    QString sku() const;
    QString name() const;
    QString category() const;
    double price() const;
    double weight() const;

private:
    QString m_id;
    QString m_sku;
    QString m_name;
    QString m_category;
    double m_price;
    double m_weight;
};

#endif
