import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

Item {
    id: root
    anchors.fill: parent

    Rectangle {
        anchors.fill: parent
        gradient: Gradient {
            GradientStop { position: 0.0; color: "#0f2027" }
            GradientStop { position: 0.5; color: "#203a43" }
            GradientStop { position: 1.0; color: "#2c5364" }
        }

        ColumnLayout {
            anchors.centerIn: parent
            spacing: 30

            Text {
                text: "SmartCartX"
                font.pixelSize: 64
                font.bold: true
                color: "white"
                font.letterSpacing: 2
                Layout.alignment: Qt.AlignHCenter
            }

            BusyIndicator {
                Layout.alignment: Qt.AlignHCenter
                Layout.preferredWidth: 60
                Layout.preferredHeight: 60
                running: true
            }
        }
    }

    // 2 second baad automatically Terminal Sequence par jump karo
    Timer {
        interval: 2000
        running: true
        onTriggered: {
            stackView.replace("BootSequenceView.qml")
        }
    }
}