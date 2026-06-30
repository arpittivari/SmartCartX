import QtQuick
import QtQuick.Controls

Window {
    id: mainWindow
    width: 1024
    height: 768
    visible: true
    title: qsTr("Smart Cart Edge Application")

    // LOCK: Jab tak Boot flow khatam na ho, C++ ko rok kar rakho
    property bool isBooting: true

    StackView {
        id: stackView
        anchors.fill: parent
        initialItem: "SplashScreen.qml" // App start hote hi Logo dikhao

        replaceEnter: Transition {
            PropertyAnimation { property: "opacity"; from: 0; to: 1; duration: 300 }
        }
        replaceExit: Transition {
            PropertyAnimation { property: "opacity"; from: 1; to: 0; duration: 300 }
        }

        Connections {
            target: stateManager
            function onStateChanged(newState) {
                // AGAR BOOTING CHAL RAHI HAI, TOH C++ KO IGNORE KARO
                if (mainWindow.isBooting) return;

                // Booting khatam hone ke baad UI yahan se change hoga
                if (stateManager.currentStateName === "BOOT") {
                    // Ignore, hum already aage badh chuke hain
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
}