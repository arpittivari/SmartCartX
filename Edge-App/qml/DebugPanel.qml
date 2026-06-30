import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

Item {
    id: root
    width: 250
    height: parent.height
    visible: true // Visible by default for this milestone testing

    Rectangle {
        anchors.fill: parent
        color: "#2C3E50"
        opacity: 0.9

        ColumnLayout {
            anchors.fill: parent
            anchors.margins: 10
            spacing: 15

            Text {
                text: "Debug Panel"
                color: "white"
                font.pixelSize: 18
                font.bold: true
            }

            Rectangle { height: 1; Layout.fillWidth: true; color: "gray" }

            Text {
                text: "State: " + debugController.currentState
                color: "lightgreen"
                font.pixelSize: 14
            }
            Text {
                text: "MQTT: " + (debugController.mqttConnected ? "Connected" : "Disconnected")
                color: debugController.mqttConnected ? "lightgreen" : "red"
                font.pixelSize: 14
            }
            Text {
                text: "UART: " + (debugController.uartConnected ? "Connected" : "Disconnected")
                color: debugController.uartConnected ? "lightgreen" : "red"
                font.pixelSize: 14
            }
            Text {
                text: "Packets RX: " + debugController.packetCount
                color: "white"
                font.pixelSize: 14
            }
            Text {
                text: "Last Pkt: " + debugController.lastPacketType
                color: "white"
                font.pixelSize: 14
            }

            Item { Layout.fillHeight: true } // Spacer
        }
    }
}