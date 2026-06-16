import QtQuick
import QtQuick.Controls

Window {
    width: 1024
    height: 768
    visible: true
    title: qsTr("Smart Cart Edge Application")

    StackView {
        id: stackView
        anchors.fill: parent
        initialItem: "SplashScreen.qml"
        
        replaceEnter: Transition {
            PropertyAnimation { property: "opacity"; from: 0; to: 1; duration: 200 }
        }
        replaceExit: Transition {
            PropertyAnimation { property: "opacity"; from: 1; to: 0; duration: 200 }
        }

        Connections {
            target: stateManager
            function onStateChanged(newState) {
                if (stateManager.currentStateName === "BOOT") {
                    stackView.replace("SplashScreen.qml")
                } else if (stateManager.currentStateName === "DEVICE_PROVISIONING") {
                    stackView.replace("ProvisioningView.qml")
                } else if (stateManager.currentStateName === "WAITING_APPROVAL") {
                    stackView.replace("WaitingApprovalView.qml")
                } else if (stateManager.currentStateName === "CUSTOMER_ONBOARDING") {
                    stackView.replace("CustomerOnboardingView.qml")
                } else if (stateManager.currentStateName === "ACTIVE_SHOPPING") {
                    stackView.replace("ShoppingView.qml")
                } else if (stateManager.currentStateName === "CHECKOUT_PENDING") {
                    stackView.replace("CheckoutScreen.qml")
                } else if (stateManager.currentStateName === "PAYMENT_COMPLETE") {
                    stackView.replace("PaymentCompleteScreen.qml")
                }
            }
        }
    }

    DebugPanel {
        id: debugPanel
        anchors.right: parent.right
        anchors.top: parent.top
        anchors.bottom: parent.bottom
    }
}