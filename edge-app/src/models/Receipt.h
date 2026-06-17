#ifndef RECEIPT_H
#define RECEIPT_H

#include <QString>
#include <QList>
#include <QJsonObject>
#include <QJsonArray>

struct ReceiptItem {
    QString name;
    int quantity;
    double price;

    QJsonObject toJson() const {
        QJsonObject obj;
        obj["name"] = name;
        obj["quantity"] = quantity;
        obj["price"] = price;
        return obj;
    }
};

struct Receipt {
    QString transactionId;
    QString timestamp;
    QList<ReceiptItem> items;
    double subtotal;
    double tax;
    double grandTotal;

    QJsonObject toJson() const {
        QJsonObject obj;
        obj["transactionId"] = transactionId;
        obj["timestamp"] = timestamp;

        QJsonArray itemsArray;
        for (const auto& item : items) {
            itemsArray.append(item.toJson());
        }
        obj["items"] = itemsArray;

        obj["subtotal"] = subtotal;
        obj["tax"] = tax;
        obj["grandTotal"] = grandTotal;
        return obj;
    }
};

#endif
