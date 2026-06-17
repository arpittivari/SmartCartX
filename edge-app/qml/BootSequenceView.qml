import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import theme

Item {
    id: root

    property int currentStep: 0
    property var steps: [
        "BOOTING",
        "LOADING CONFIGURATION",
        "INITIALIZING HARDWARE",
        "CONNECTING MQTT",
        "LOADING SERVICES",
        "READY"
    ]

    Rectangle {
        anchors.fill: parent
        color: Theme.primaryDarkBlue

        ColumnLayout {
            anchors.centerIn: parent
            spacing: Theme.spacingLarge

            Text {
                text: "System Boot"
                color: Theme.primaryWhite
                font.pixelSize: Theme.fontSizeTitle
                font.bold: true
                Layout.alignment: Qt.AlignHCenter
            }

            ColumnLayout {
                spacing: Theme.spacingSmall
                Layout.alignment: Qt.AlignHCenter

                Repeater {
                    model: root.steps.length

                    Text {
                        text: root.steps[index]
                        color: index <= root.currentStep ? Theme.primaryWhite : Theme.primaryLightGray
                        opacity: index <= root.currentStep ? 1.0 : 0.5
                        font.pixelSize: Theme.fontSizeMedium
                        font.bold: index === root.currentStep
                    }
                }
            }
        }
    }

    Timer {
        id: bootTimer
        interval: 500
        repeat: true
        running: true
        onTriggered: {
            if (root.currentStep < root.steps.length - 1) {
                root.currentStep++
            } else {
                bootTimer.stop()
                if (stateManager.currentStateName === "DEVICE_PROVISIONING") {
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
                } else {
                    if (stackView) stackView.replace("ProvisioningView.qml")
                }
            }
        }
    }
}
