import QtQuick 2.15
import QtQuick.Controls 2.15
import QtQuick.Layouts 1.15

Item {
    id: root
    anchors.fill: parent

    Rectangle {
        anchors.fill: parent
        color: "#f8f9fa"

        Button {
            text: "⚙️"
            anchors.top: parent.top
            anchors.right: parent.right
            anchors.margins: 20
            font.pixelSize: 28
            width: 50
            height: 50

            background: Rectangle {
                color: "transparent"
                radius: 25
            }

            onClicked: {
                stackView.push("SettingsScreen.qml")
            }
        }

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
                        text: "Welcome to Smart Cart X"
                        font.pixelSize: 28
                        font.bold: true
                        color: "#222222"
                        Layout.alignment: Qt.AlignHCenter
                    }

                    Text {
                        text: "Please enter your mobile number to unlock the cart."
                        font.pixelSize: 15
                        color: "#666666"
                        Layout.alignment: Qt.AlignHCenter
                    }
                }

                TextField {
                    id: phoneInput
                    placeholderText: "Enter Mobile Number"
                    font.pixelSize: 18
                    color: "black"
                    horizontalAlignment: TextInput.AlignHCenter
                    Layout.preferredWidth: 340
                    Layout.preferredHeight: 55
                    Layout.alignment: Qt.AlignHCenter

                    validator: RegularExpressionValidator { regularExpression: /^[0-9]{10}$/ }

                    background: Rectangle {
                        color: "#f4f4f4"
                        radius: 8
                        border.color: phoneInput.activeFocus ? "#0078D7" : "#e0e0e0"
                        border.width: phoneInput.activeFocus ? 2 : 1
                    }
                }

                Button {
                    text: "Start Shopping"
                    font.pixelSize: 18
                    font.bold: true
                    Layout.preferredWidth: 340
                    Layout.preferredHeight: 55
                    Layout.alignment: Qt.AlignHCenter

                    background: Rectangle {
                        color: parent.down ? "#005bb5" : "#0078D7"
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
                        if (phoneInput.text !== "") {
                            stateManager.handleCustomerEntered()
                        }
                    }
                }
            }
        }
    }
}
