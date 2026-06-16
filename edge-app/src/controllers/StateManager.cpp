#include "StateManager.h"
#include <QDebug>

StateManager::StateManager(QObject *parent) 
    : QObject(parent), m_currentState(AppState::BOOT) 
{
}

QString StateManager::currentStateName() const {
    switch (m_currentState) {
        case AppState::BOOT: return "BOOT";
        case AppState::CHECK_DEVICE_CONFIGURATION: return "CHECK_DEVICE_CONFIGURATION";
        case AppState::DEVICE_PROVISIONING: return "DEVICE_PROVISIONING";
        case AppState::WAITING_APPROVAL: return "WAITING_APPROVAL";
        case AppState::CUSTOMER_ONBOARDING: return "CUSTOMER_ONBOARDING";
        case AppState::ACTIVE_SHOPPING: return "ACTIVE_SHOPPING";
        case AppState::CHECKOUT_PENDING: return "CHECKOUT_PENDING";
        case AppState::PAYMENT_COMPLETE: return "PAYMENT_COMPLETE";
        default: return "UNKNOWN";
    }
}

void StateManager::transitionTo(AppState newState) {
    if (m_currentState != newState) {
        qDebug() << "[StateManager] Transition:" << currentStateName() << "->" << [newState]() -> QString {
            switch(newState) {
                case AppState::BOOT: return "BOOT";
                case AppState::CHECK_DEVICE_CONFIGURATION: return "CHECK_DEVICE_CONFIGURATION";
                case AppState::DEVICE_PROVISIONING: return "DEVICE_PROVISIONING";
                case AppState::WAITING_APPROVAL: return "WAITING_APPROVAL";
                case AppState::CUSTOMER_ONBOARDING: return "CUSTOMER_ONBOARDING";
                case AppState::ACTIVE_SHOPPING: return "ACTIVE_SHOPPING";
                case AppState::CHECKOUT_PENDING: return "CHECKOUT_PENDING";
                case AppState::PAYMENT_COMPLETE: return "PAYMENT_COMPLETE";
                default: return "UNKNOWN";
            }
        }();
        m_currentState = newState;
        emit stateChanged(m_currentState);
    }
}

void StateManager::checkDeviceConfiguration() {
    // Expected to be called by AppContext or Boot logic after BOOT completes
    if (m_currentState == AppState::BOOT) {
        transitionTo(AppState::CHECK_DEVICE_CONFIGURATION);
    }
}

void StateManager::handleConfigLoaded() {
    if (m_currentState == AppState::CHECK_DEVICE_CONFIGURATION) {
        transitionTo(AppState::CUSTOMER_ONBOARDING);
    } else {
        qWarning() << "[StateManager] Invalid transition: ConfigLoaded event in state" << currentStateName();
    }
}

void StateManager::handleConfigMissing() {
    if (m_currentState == AppState::CHECK_DEVICE_CONFIGURATION) {
        transitionTo(AppState::DEVICE_PROVISIONING);
    } else {
        qWarning() << "[StateManager] Invalid transition: ConfigMissing event in state" << currentStateName();
    }
}

void StateManager::startProvisioning() {
    if (m_currentState == AppState::DEVICE_PROVISIONING) {
        transitionTo(AppState::WAITING_APPROVAL);
    } else {
        qWarning() << "[StateManager] Invalid transition: StartProvisioning event in state" << currentStateName();
    }
}

void StateManager::handleApprovalReceived() {
    if (m_currentState == AppState::WAITING_APPROVAL) {
        // Technically goes to save config -> reboot, but mapped to BOOT for simplicity here
        transitionTo(AppState::BOOT); 
    } else {
        qWarning() << "[StateManager] Invalid transition: ApprovalReceived event in state" << currentStateName();
    }
}

void StateManager::handleCustomerEntered() {
    if (m_currentState == AppState::CUSTOMER_ONBOARDING) {
        transitionTo(AppState::ACTIVE_SHOPPING);
    } else {
        qWarning() << "[StateManager] Invalid transition: CustomerEntered event in state" << currentStateName();
    }
}

void StateManager::handleShoppingStarted() {
    if (m_currentState == AppState::ACTIVE_SHOPPING) {
        // Already shopping, ignore
    }
}

void StateManager::handleCheckoutRequested() {
    if (m_currentState == AppState::ACTIVE_SHOPPING) {
        transitionTo(AppState::CHECKOUT_PENDING);
    } else {
        qWarning() << "[StateManager] Invalid transition: CheckoutRequested event in state" << currentStateName();
    }
}

void StateManager::handlePaymentCompleted() {
    if (m_currentState == AppState::CHECKOUT_PENDING) {
        transitionTo(AppState::PAYMENT_COMPLETE);
    } else {
        qWarning() << "[StateManager] Invalid transition: PaymentCompleted event in state" << currentStateName();
    }
}

void StateManager::handleSessionReset() {
    if (m_currentState == AppState::PAYMENT_COMPLETE || m_currentState == AppState::ACTIVE_SHOPPING || m_currentState == AppState::CHECKOUT_PENDING) {
        transitionTo(AppState::CUSTOMER_ONBOARDING);
    } else {
        qWarning() << "[StateManager] Invalid transition: SessionReset event in state" << currentStateName();
    }
}