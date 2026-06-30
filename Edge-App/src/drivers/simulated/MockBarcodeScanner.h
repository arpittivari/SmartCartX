#ifndef MOCK_BARCODE_SCANNER_H
#define MOCK_BARCODE_SCANNER_H

#include "../interfaces/IBarcodeScanner.h"
#include <QTimer>

class MockBarcodeScanner : public IBarcodeScanner {
    Q_OBJECT
public:
    explicit MockBarcodeScanner(QObject* parent = nullptr);

public slots:
    void startMocking();
    void stopMocking();

private slots:
    void onScanTick();

private:
    QTimer* m_timer;
};

#endif