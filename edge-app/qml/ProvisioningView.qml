import QtQuick 2.15
import QtQuick.Controls 2.15
import QtQuick.Layouts 1.15

Item {
    id: root
    anchors.fill: parent

    Rectangle {
        anchors.fill: parent
        color: "#f8f9fa"

        Rectangle {
            anchors.centerIn: parent
            width: 480
            height: 380
            color: "white"
            radius: 16
            border.color: "#e0e0e0"
            border.width: 1

            ColumnLayout {
                anchors.centerIn: parent
                spacing: 30

                ColumnLayout {
                    spacing: 8
                    Layout.alignment: Qt.AlignHCenter

                    Text {
                        text: "Device Provisioning"
                        font.pixelSize: 28
                        font.bold: true
                        color: "#222222"
                        Layout.alignment: Qt.AlignHCenter
                    }

                    Text {
                        text: "Enter Mall ID to register this Smart Cart."
                        font.pixelSize: 15
                        color: "#666666"
                        Layout.alignment: Qt.AlignHCenter
                    }
                }

                TextField {
                    id: mallIdInput
                    placeholderText: "e.g. MALL_123"
                    font.pixelSize: 18
                    color: "black"
                    horizontalAlignment: TextInput.AlignHCenter
                    Layout.preferredWidth: 340
                    Layout.preferredHeight: 55
                    Layout.alignment: Qt.AlignHCenter

                    background: Rectangle {
                        color: "#f4f4f4"
                        radius: 8
                        border.color: mallIdInput.activeFocus ? "#0078D7" : "#e0e0e0"
                        border.width: mallIdInput.activeFocus ? 2 : 1
                    }
                }

                Button {
                    id: provisionBtn
                    text: "Provision Device"
                    font.pixelSize: 18
                    font.bold: true
                    Layout.preferredWidth: 340
                    Layout.preferredHeight: 55
                    Layout.alignment: Qt.AlignHCenter

                    background: Rectangle {
                        color: parent.down ? "#005bb5" : (provisionBtn.enabled ? "#0078D7" : "#6c757d")
                        radius: 8
                    }

                    contentItem: Text {
                        text: parent.text
                        color: "white"
                        horizontalAlignment: Text.AlignHCenter
                        verticalAlignment: Text.AlignVCenter
                        font: parent.font
                    }

                    onClicked: {
                        if (mallIdInput.text !== "") {
                            provisionBtn.text = "Connecting to Server..."
                            provisionBtn.enabled = false
                            if (typeof provisioningService !== "undefined") {
                                provisioningService.setMallId(mallIdInput.text);
                                provisioningService.startProvisioning();
                                // State transition usually happens when provisioning starts or completes
                                if (typeof stateManager !== "undefined") {
                                    stateManager.startProvisioning();
                                }
                            } else {
                                mockVerificationTimer.start()
                            }
                        }
                    }
                }
            }
        }
    }

    Timer {
        id: mockVerificationTimer
        interval: 1500
        onTriggered: {
            stackView.replace("CustomerOnboardingView.qml")
        }
    }
}
