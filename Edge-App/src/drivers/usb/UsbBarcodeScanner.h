#ifndef USB_BARCODE_SCANNER_H
#define USB_BARCODE_SCANNER_H

#include "../interfaces/IBarcodeScanner.h"

// Forward stub
class UsbBarcodeScanner : public IBarcodeScanner {
    Q_OBJECT
public:
    explicit UsbBarcodeScanner(QObject* parent = nullptr);
    virtual ~UsbBarcodeScanner();
};

#endif
