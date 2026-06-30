import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

Item {
    id: root
    anchors.fill: parent

    // Premium Light Background
    Rectangle {
        anchors.fill: parent
        color: "#f8f9fa"

        // Center Card Container
        Rectangle {
            anchors.centerIn: parent
            width: parent.width * 0.7
            height: parent.height * 0.8
            color: "white"
            radius: 12
            border.color: "#e0e0e0"
            border.width: 1

            ColumnLayout {
                anchors.fill: parent
                anchors.margins: 40
                spacing: 20

                // Header
                Text {
                    text: "System Configuration"
                    font.pixelSize: 28
                    font.bold: true
                    color: "#222222"
                    Layout.alignment: Qt.AlignHCenter
                }

                Rectangle { Layout.fillWidth: true; height: 1; color: "#eeeeee" } // Divider

                // Settings Grid
                GridLayout {
                    columns: 2
                    columnSpacing: 60
                    rowSpacing: 18
                    Layout.alignment: Qt.AlignHCenter
                    Layout.topMargin: 10
                    Layout.bottomMargin: 10

                    // Helper Component for consistent Key-Value styling
                    component SettingsKey: Text { font.pixelSize: 18; color: "#666666" }
                    component SettingsValue: Text { font.pixelSize: 18; font.bold: true; color: "#222222" }

                    SettingsKey { text: "Cart ID:" }
                    SettingsValue { text: settingsController ? settingsController.cartId : "UNASSIGNED" }

                    SettingsKey { text: "Mall ID:" }
                    SettingsValue { text: settingsController ? settingsController.mallId : "UNASSIGNED" }

                    SettingsKey { text: "Hardware Mode:" }
                    SettingsValue { text: "Simulator"; color: "#0078D7" }

                    SettingsKey { text: "MQTT Status:" }
                    SettingsValue {
                        text: (typeof debugController !== "undefined" && debugController.mqttConnected) ? "Connected" : "Connected (Mock)"
                        color: "green"
                    }

                    SettingsKey { text: "MQTT Broker:" }
                    SettingsValue { text: "broker.hivemq.com" }

                    SettingsKey { text: "Software Version:" }
                    SettingsValue { text: "SmartCartX v1.0.0" }

                    SettingsKey { text: "Device Health:" }
                    SettingsValue { text: "Optimal"; color: "#28a745" }

                    SettingsKey { text: "Last Heartbeat:" }
                    SettingsValue { text: "Just now" }
                }

                Rectangle { Layout.fillWidth: true; height: 1; color: "#eeeeee" } // Divider

                // Bottom Action Area
                RowLayout {
                    Layout.fillWidth: true
                    Layout.topMargin: 10
                    spacing: 20

                    CheckBox {
                        text: "Developer Mode"
                        font.pixelSize: 16
                        checked: settingsController ? settingsController.developerMode : false
                        onCheckedChanged: {
                            if (settingsController && checked !== settingsController.developerMode) {
                                settingsController.developerMode = checked;
                            }
                        }
                    }

                    Item { Layout.fillWidth: true } // Flexible spacer to push buttons to the right

                    // Back Button (Neutral)
                    Button {
                        text: "Back to App"
                        font.pixelSize: 16
                        Layout.preferredWidth: 140
                        Layout.preferredHeight: 45

                        background: Rectangle {
                            color: parent.down ? "#d4d4d4" : "#e0e0e0"
                            radius: 6
                        }
                        contentItem: Text {
                            text: parent.text
                            color: "#333333"
                            horizontalAlignment: Text.AlignHCenter
                            verticalAlignment: Text.AlignVCenter
                            font: parent.font
                        }

                        onClicked: {
                                                    stackView.replace("ProvisioningView.qml")
                                                }
                    }

                    // Factory Reset Button (Danger Red)
                    Button {
                        text: "Factory Reset"
                        font.pixelSize: 16
                        font.bold: true
                        Layout.preferredWidth: 140
                        Layout.preferredHeight: 45

                        background: Rectangle {
                            color: parent.down ? "#c82333" : "#dc3545" // Warning Red
                            radius: 6
                        }
                        contentItem: Text {
                            text: parent.text
                            color: "white"
                            horizontalAlignment: Text.AlignHCenter
                            verticalAlignment: Text.AlignVCenter
                            font: parent.font
                        }

                        onClicked: factoryResetDialog.open()
                    }
                }
            }
        }
    }

    // Modernized Dialog
    Dialog {
        id: factoryResetDialog
        title: "System Warning"
        standardButtons: Dialog.Ok | Dialog.Cancel
        anchors.centerIn: parent
        width: 400

        // Dialog custom styling setup
        background: Rectangle {
            color: "white"
            radius: 8
            border.color: "#cccccc"
        }

        Label {
            text: "Are you sure you want to completely erase device configurations and factory reset this Smart Cart?"
            font.pixelSize: 16
            color: "#333333"
            wrapMode: Text.WordWrap
            width: parent.width
        }

        onAccepted: {
            if (settingsController) settingsController.factoryReset()
            // Optional: stackView.replace("SplashScreen.qml")
        }
    }
}