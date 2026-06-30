import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QtMultimedia
Item {
    id: root
    anchors.fill: parent

    // Premium Light Background
    Rectangle {
        anchors.fill: parent
        color: "#f8f9fa"

        // Digital Receipt Card
        Rectangle {
            anchors.centerIn: parent
            width: 460
            height: 560
            color: "white"
            radius: 16
            border.color: "#e0e0e0"
            border.width: 1

            ColumnLayout {
                anchors.fill: parent
                anchors.margins: 40
                spacing: 20

                // Success Icon (Green Circle with Checkmark)
                Rectangle {
                    Layout.alignment: Qt.AlignHCenter
                    width: 90
                    height: 90
                    radius: 45
                    color: "#28a745" // Success Green

                    Text {
                        anchors.centerIn: parent
                        text: "✓"
                        color: "white"
                        font.pixelSize: 50
                        font.bold: true
                    }
                    SoundEffect {
                        id: successSound
                        source: "file:///" + applicationDirPath + "/sounds/success.wav"
                        volume: 1.0
                    }
                    Component.onCompleted: {
                        successSound.play()
                    }
                    // A nice popup animation when screen loads
                    SequentialAnimation on scale {
                        running: true
                        NumberAnimation { from: 0.0; to: 1.1; duration: 400; easing.type: Easing.OutBack }
                        NumberAnimation { from: 1.1; to: 1.0; duration: 200; easing.type: Easing.InOutQuad }
                    }
                }

                Item { Layout.preferredHeight: 5 } // Spacer

                // Headings
                Text {
                    text: "Payment Successful!"
                    font.pixelSize: 28
                    font.bold: true
                    color: "#222222"
                    Layout.alignment: Qt.AlignHCenter
                }

                Text {
                    text: "Thank you for shopping with SmartCartX."
                    font.pixelSize: 16
                    color: "#666666"
                    Layout.alignment: Qt.AlignHCenter
                }

                Item { Layout.preferredHeight: 15 } // Spacer

                // Divider line
                Rectangle { Layout.fillWidth: true; height: 1; color: "#eeeeee" }

                Item { Layout.preferredHeight: 15 } // Spacer

                // Transaction Details (Grid)
                GridLayout {
                    columns: 2
                    Layout.fillWidth: true
                    columnSpacing: 20
                    rowSpacing: 18

                    Text { text: "Amount Paid:"; font.pixelSize: 16; color: "#777777" }
                    Text { text: "₹210.00"; font.pixelSize: 20; font.bold: true; color: "#28a745"; Layout.alignment: Qt.AlignRight }

                    Text { text: "Payment Mode:"; font.pixelSize: 16; color: "#777777" }
                    Text { text: "UPI Scanner"; font.pixelSize: 16; font.bold: true; color: "#222222"; Layout.alignment: Qt.AlignRight }

                    Text { text: "Transaction ID:"; font.pixelSize: 16; color: "#777777" }
                    Text { text: "TXN9876543210"; font.pixelSize: 16; font.bold: true; color: "#222222"; Layout.alignment: Qt.AlignRight }
                }

                Item { Layout.fillHeight: true } // Pushes the button to the bottom

                // Action Button to reset flow
                Button {
                    text: "Done / New Customer"
                    font.pixelSize: 18
                    font.bold: true
                    Layout.fillWidth: true
                    Layout.preferredHeight: 55

                    background: Rectangle {
                        color: parent.down ? "#005bb5" : "#0078D7" // Premium Blue
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
                        // Poore checkout session ko khatam karke wapas Onboarding par le jayein
                        stackView.replace("CustomerOnboardingView.qml")
                    }
                }
            }
        }
    }
}