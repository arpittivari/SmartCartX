#include "ShoppingService.h"
#include <QDebug>

ShoppingService::ShoppingService(TelemetryService* telemetry, IWeightSensor* weightSensor, IBarcodeScanner* scanner, IAudioPlayer* audio, QObject *parent)
    : QObject(parent), m_telemetry(telemetry), m_weightSensor(weightSensor), m_scanner(scanner), m_audio(audio)
{
    m_catalog = new ProductCatalog(this);
    m_cart = new CartModel(this);

    connect(m_cart, &CartModel::cartChanged, this, &ShoppingService::onCartUpdated);

    if (m_weightSensor) {
        connect(m_weightSensor, &IWeightSensor::weightChanged, this, &ShoppingService::onWeightChanged);
    }
    if (m_scanner) {
        connect(m_scanner, &IBarcodeScanner::barcodeScanned, this, &ShoppingService::onBarcodeScanned);
    }
}

void ShoppingService::startSession(const CustomerProfile& customer) {
    m_cart->clearCart();
    m_session.start(customer);
    m_isActive = true;
    emit activeChanged();

    qDebug() << "[ShoppingService] Session started:" << m_session.sessionId() << "for customer:" << customer.identifier();
    
    if (m_telemetry) {
        m_telemetry->updateState(CartState::SHOPPING);
        m_telemetry->publishSessionUpdate(m_session);
        m_telemetry->publishSessionStarted(m_session.sessionId(), customer.identifier()); // Ensure this maps correctly based on Phase 6 contracts. Let's rely on standard session events.
    }
}

void ShoppingService::onWeightChanged(int grams) {
    qDebug() << "[ShoppingService] Processing Weight Event:" << grams << "g";
    if (m_telemetry) {
        m_telemetry->publishWeightUpdate(grams);
    }
}

void ShoppingService::onBarcodeScanned(const QString& data) {
    qDebug() << "[ShoppingService] Barcode Scanned:" << data;
    if (m_isActive) {
        addItem(data);
    }
}

void ShoppingService::addItem(const QString& sku) {
    Product* product = m_catalog->getProductBySku(sku);
    if (product) {
        m_cart->addItem(product, 1);
        if (m_audio) m_audio->playSound(SoundEvent::ITEM_ADDED);
        if (m_telemetry) m_telemetry->publishItemEvent("ITEM_ADDED", sku, product->price());
    } else {
        qWarning() << "[ShoppingService] Unknown SKU scanned:" << sku;
        if (m_audio) m_audio->playSound(SoundEvent::ERROR_SOUND);
    }
}

void ShoppingService::removeItem(const QString& sku) {
    Product* product = m_catalog->getProductBySku(sku);
    if (product) {
        m_cart->removeItem(sku);
        if (m_audio) m_audio->playSound(SoundEvent::ITEM_REMOVED);
        if (m_telemetry) m_telemetry->publishItemEvent("ITEM_REMOVED", sku, product->price());
    }
}

void ShoppingService::updateQuantity(const QString& sku, int quantity) {
    m_cart->updateQuantity(sku, quantity);
}

void ShoppingService::onCartUpdated() {
    if (m_isActive && m_telemetry) {
        m_telemetry->publishCartTotal(m_cart->totalQuantity(), m_cart->totalPrice(), m_cart->totalWeight());
    }
}

void ShoppingService::endSession() {
    m_session.end();
    m_isActive = false;
    emit activeChanged();

    qDebug() << "[ShoppingService] Session ended:" << m_session.sessionId();
    
    if (m_telemetry) {
        m_telemetry->updateState(CartState::READY);
        m_telemetry->publishSessionUpdate(m_session);
        m_telemetry->publishSessionEnded(m_session.sessionId());
    }

    m_cart->clearCart();
}
