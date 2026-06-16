#ifndef IBARCODE_SCANNER_H
#define IBARCODE_SCANNER_H

#include <QObject>
#include <QString>

class IBarcodeScanner : public QObject {
    Q_OBJECT
public:
    explicit IBarcodeScanner(QObject* parent = nullptr) : QObject(parent) {}
    virtual ~IBarcodeScanner() = default;

signals:
    void barcodeScanned(const QString& barcodeData);
};

#endif