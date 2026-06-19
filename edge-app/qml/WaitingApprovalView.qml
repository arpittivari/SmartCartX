import QtQuick
import QtQuick.Controls

Item {
    id: root
    anchors.fill: parent

    Rectangle {
        anchors.fill: parent
        color: "#2c3e50"

        Column {
            anchors.centerIn: parent
            spacing: 20

            Rectangle {
                width: 60; height: 60
                radius: 30
                color: "#F39C12"
                anchors.horizontalCenter: parent.horizontalCenter

                SequentialAnimation on scale {
                    loops: Animation.Infinite
                    NumberAnimation { from: 1.0; to: 1.2; duration: 800 }
                    NumberAnimation { from: 1.2; to: 1.0; duration: 800 }
                }
            }

            Text {
                text: "Awaiting Admin Approval"
                color: "white"
                font.pixelSize: 32
                font.bold: true
            }

            Text {
                text: "Please hold while the system connects to the master terminal..."
                color: "#bdc3c7"
                font.pixelSize: 16
            }
        }
    }
}
