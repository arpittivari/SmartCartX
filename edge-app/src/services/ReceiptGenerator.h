#ifndef RECEIPT_GENERATOR_H
#define RECEIPT_GENERATOR_H

#include <QObject>
#include "../models/Receipt.h"

class ReceiptGenerator : public QObject {
    Q_OBJECT
public:
    explicit ReceiptGenerator(QObject *parent = nullptr);

public slots:
    void generateReceipt(const Receipt& receipt);
};

#endif
