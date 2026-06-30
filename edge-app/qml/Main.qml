import QtQuick 2.15
import QtQuick.Controls 2.15
import QtQuick.VirtualKeyboard 2.15
import QtQuick.Window 2.15

Window {
    id: mainWindow
    width: 1024
    height: 768
    visible: true
    title: qsTr("Smart Cart Edge Application")

    property bool isBooting: true

    Item {
        id: container
        anchors.fill: parent

        StackView {
            id: stackView
            anchors.left: parent.left
            anchors.right: parent.right
            anchors.top: parent.top
            anchors.bottom: inputPanel.visible ? inputPanel.top : parent.bottom
            initialItem: "SplashScreen.qml"

            replaceEnter: Transition {
                PropertyAnimation { property: "opacity"; from: 0; to: 1; duration: 300 }
            }
            replaceExit: Transition {
                PropertyAnimation { property: "opacity"; from: 1; to: 0; duration: 300 }
            }

            Connections {
                target: stateManager
                function onStateChanged(newState) {
                    if (mainWindow.isBooting) return;

                    if (stateManager.currentStateName === "BOOT") {
                        // Ignore, already handled
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

        InputPanel {
            id: inputPanel
            z: 99
            x: 0
            y: parent.height
            width: parent.width

            states: State {
                name: "visible"
                when: inputPanel.active
                PropertyChanges {
                    target: inputPanel
                    y: parent.height - inputPanel.height
                }
            }
            transitions: Transition {
                from: ""
                to: "visible"
                reversible: true
                ParallelAnimation {
                    NumberAnimation {
                        properties: "y"
                        duration: 250
                        easing.type: Easing.InOutQuad
                    }
                }
            }
        }
    }
}