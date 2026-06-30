#ifndef STATE_MANAGER_H
#define STATE_MANAGER_H

#include <QObject>
#include <QString>

enum class AppState {
    BOOT,
    CHECK_DEVICE_CONFIGURATION,
    DEVICE_PROVISIONING,
    WAITING_APPROVAL,
    CUSTOMER_ONBOARDING,
    ACTIVE_SHOPPING,
    CHECKOUT_PENDING,
    PAYMENT_COMPLETE
};

class StateManager : public QObject {
    Q_OBJECT
    Q_PROPERTY(QString currentStateName READ currentStateName NOTIFY stateChanged)

public:
    explicit StateManager(QObject *parent = nullptr);
    virtual ~StateManager() = default;

    AppState currentState() const { return m_currentState; }
    QString currentStateName() const;

    void checkDeviceConfiguration();

public slots:
    // Event-driven transitions
    void handleConfigLoaded();
    void handleConfigMissing();
    void startProvisioning();
    void handleApprovalReceived();
    void handleCustomerEntered();
    void handleShoppingStarted();
    void handleCheckoutRequested();
    void handlePaymentCompleted();
    void handleSessionReset();

signals:
    void stateChanged(AppState newState);

private:
    AppState m_currentState;
    void transitionTo(AppState newState);
};

#endif