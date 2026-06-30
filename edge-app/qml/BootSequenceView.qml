import QtQuick 2.15
import QtQuick.Controls 2.15
import QtQuick.Layouts 1.15
import QtMultimedia 5.15

Item {
    id: root
    anchors.fill: parent

    property int currentStep: 0
    property var steps: [
        "[ OK ]  Mounting File Systems...",
        "[ OK ]  Loading Core Configuration...",
        "[ OK ]  Initializing STM32 Hardware Sensors...",
        "[ OK ]  Establishing Secure MQTT Connection...",
        "[ OK ]  Loading Edge AI Models...",
        "[ OK ]  System Ready. Handing over to UI..."
    ]

    Rectangle {
        anchors.fill: parent
        color: "#0a0a0a"

        ColumnLayout {
            anchors.fill: parent
            anchors.margins: 40
            spacing: 10

            Text {
                text: "SmartCartX OS Bootloader v1.0.4"
                color: "#555555"
                font.pixelSize: 16
                font.family: "Courier New"
                Layout.alignment: Qt.AlignLeft
                Layout.bottomMargin: 20
            }

            ListView {
                id: bootList
                Layout.fillWidth: true
                Layout.fillHeight: true
                model: root.steps.length
                interactive: false

                delegate: Item {
                    width: bootList.width
                    height: 30
                    visible: index <= root.currentStep

                    RowLayout {
                        anchors.fill: parent
                        Text {
                            text: root.steps[index]
                            color: index === root.currentStep ? "#00ff00" : "#00aa00"
                            font.pixelSize: 18
                            font.family: "Courier New"
                            font.bold: index === root.currentStep
                        }
                        Text {
                            text: "█"
                            color: "#00ff00"
                            font.pixelSize: 18
                            visible: index === root.currentStep
                            SequentialAnimation on opacity {
                                loops: Animation.Infinite
                                NumberAnimation { to: 0; duration: 300 }
                                NumberAnimation { to: 1; duration: 300 }
                            }
                        }
                    }
                }
            }
        }
    }

    SoundEffect {
        id: bootSound
        source: "file:///app/edge-app/sounds/boot.wav"
        volume: 0.8
    }

    Timer {
        id: bootTimer
        interval: 500
        repeat: true
        running: true
        onTriggered: {
            if (root.currentStep === 0) {
                bootSound.play()
            }

            if (root.currentStep < root.steps.length - 1) {
                root.currentStep++
            } else {
                bootTimer.stop()
                delayTimer.start()
            }
        }
    }

    Timer {
        id: delayTimer
        interval: 1000
        onTriggered: {
            // mainWindow is no longer a boolean we modify from here,
            // we let the stateManager drive if possible, or emit a signal.
            // But preserving user's code:
            if (typeof mainWindow !== "undefined") {
                mainWindow.isBooting = false
            }

            if (stateManager.currentStateName === "DEVICE_PROVISIONING" || stateManager.currentStateName === "BOOT") {
                stackView.replace("ProvisioningView.qml")
            } else {
                stackView.replace("CustomerOnboardingView.qml")
            }
        }
    }
}
