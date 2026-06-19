import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

Item {
    id: root
    width: 250
    height: parent.height
    visible: true

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
                text: "State: " + (typeof debugController !== 'undefined' ? debugController.currentState : 'Unknown')
                color: "lightgreen"
                font.pixelSize: 14
            }
            Text {
                text: "MQTT: " + (typeof debugController !== 'undefined' && debugController.mqttConnected ? "Connected" : "Disconnected")
                color: (typeof debugController !== 'undefined' && debugController.mqttConnected) ? "lightgreen" : "red"
                font.pixelSize: 14
            }
            Text {
                text: "UART: " + (typeof debugController !== 'undefined' && debugController.uartConnected ? "Connected" : "Disconnected")
                color: (typeof debugController !== 'undefined' && debugController.uartConnected) ? "lightgreen" : "red"
                font.pixelSize: 14
            }
            Text {
                text: "Packets RX: " + (typeof debugController !== 'undefined' ? debugController.packetCount : 0)
                color: "white"
                font.pixelSize: 14
            }
            Text {
                text: "Last Pkt: " + (typeof debugController !== 'undefined' ? debugController.lastPacketType : 'None')
                color: "white"
                font.pixelSize: 14
            }

            Item { Layout.fillHeight: true }
        }
    }
}
