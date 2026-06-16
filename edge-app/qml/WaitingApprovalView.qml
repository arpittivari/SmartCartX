import QtQuick

Item {
    Rectangle {
        anchors.fill: parent
        color: "#F39C12"

        Text {
            anchors.centerIn: parent
            text: "Waiting for Admin Approval..."
            color: "white"
            font.pixelSize: 32
        }
    }
}