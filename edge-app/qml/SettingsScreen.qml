import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import theme

Item {
    id: root

    Rectangle {
        anchors.fill: parent
        color: Theme.primaryLightGray

        ColumnLayout {
            anchors.centerIn: parent
            spacing: Theme.spacingMedium
            width: parent.width * 0.8

            Text {
                text: "Settings"
                font.pixelSize: Theme.fontSizeTitle
                font.bold: true
                color: Theme.primaryDarkBlue
                Layout.alignment: Qt.AlignHCenter
                Layout.bottomMargin: Theme.spacingLarge
            }

            GridLayout {
                columns: 2
                columnSpacing: Theme.spacingLarge
                rowSpacing: Theme.spacingMedium
                Layout.alignment: Qt.AlignHCenter

                Text { text: "Cart ID:"; font.pixelSize: Theme.fontSizeMedium; font.bold: true; color: Theme.textColor }
                Text { text: settingsController ? settingsController.cartId : ""; font.pixelSize: Theme.fontSizeMedium; color: Theme.textColor }

                Text { text: "Mall ID:"; font.pixelSize: Theme.fontSizeMedium; font.bold: true; color: Theme.textColor }
                Text { text: settingsController ? settingsController.mallId : ""; font.pixelSize: Theme.fontSizeMedium; color: Theme.textColor }

                Text { text: "Hardware Mode:"; font.pixelSize: Theme.fontSizeMedium; font.bold: true; color: Theme.textColor }
                Text { text: "Simulator"; font.pixelSize: Theme.fontSizeMedium; color: Theme.textColor }

                Text { text: "MQTT Status:"; font.pixelSize: Theme.fontSizeMedium; font.bold: true; color: Theme.textColor }
                Text { text: (debugController && debugController.mqttConnected) ? "Connected" : "Disconnected"; font.pixelSize: Theme.fontSizeMedium; color: (debugController && debugController.mqttConnected) ? "green" : "red" }

                Text { text: "MQTT Broker:"; font.pixelSize: Theme.fontSizeMedium; font.bold: true; color: Theme.textColor }
                Text { text: settingsController ? settingsController.mqttBroker : ""; font.pixelSize: Theme.fontSizeMedium; color: Theme.textColor }

                Text { text: "Software Version:"; font.pixelSize: Theme.fontSizeMedium; font.bold: true; color: Theme.textColor }
                Text { text: "SmartCartX v0.1.0"; font.pixelSize: Theme.fontSizeMedium; color: Theme.textColor }

                Text { text: "Device Health:"; font.pixelSize: Theme.fontSizeMedium; font.bold: true; color: Theme.textColor }
                Text { text: "OK"; font.pixelSize: Theme.fontSizeMedium; color: "green" }

                Text { text: "Last Heartbeat:"; font.pixelSize: Theme.fontSizeMedium; font.bold: true; color: Theme.textColor }
                Text { text: "Just now"; font.pixelSize: Theme.fontSizeMedium; color: Theme.textColor }
            }

            RowLayout {
                Layout.alignment: Qt.AlignHCenter
                Layout.topMargin: Theme.spacingLarge
                spacing: Theme.spacingLarge

                CheckBox {
                    text: "Developer Mode"
                    checked: settingsController ? settingsController.developerMode : false
                    onCheckedChanged: {
                        if (settingsController && checked !== settingsController.developerMode) {
                            settingsController.developerMode = checked;
                        }
                    }
                }

                Button {
                    text: "Factory Reset"
                    onClicked: factoryResetDialog.open()
                }

                Button {
                    text: "Back"
                    onClicked: stackView.pop()
                }
            }
        }
    }

    Dialog {
        id: factoryResetDialog
        title: "Confirm Factory Reset"
        standardButtons: Dialog.Ok | Dialog.Cancel
        anchors.centerIn: parent

        Label {
            text: "Are you sure you want to factory reset this device?"
        }

        onAccepted: {
            if (settingsController) settingsController.factoryReset()
        }
    }
}
