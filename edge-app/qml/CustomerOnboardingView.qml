import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import theme

Item {
    Rectangle {
        anchors.fill: parent
        color: Theme.primaryLightGray

        ColumnLayout {
            anchors.centerIn: parent
            spacing: Theme.spacingMedium

            Text {
                text: "Welcome to Smart Cart X"
                color: Theme.primaryDarkBlue
                font.pixelSize: Theme.fontSizeTitle
                font.bold: true
                Layout.alignment: Qt.AlignHCenter
            }

            TextField {
                id: phoneInput
                placeholderText: "Enter Phone Number to Start"
                font.pixelSize: Theme.fontSizeMedium
                Layout.alignment: Qt.AlignHCenter
                Layout.preferredWidth: 300
            }

            Button {
                text: "Start Shopping"
                Layout.alignment: Qt.AlignHCenter
                Layout.preferredWidth: 300
                Layout.preferredHeight: 50
                font.pixelSize: Theme.fontSizeLarge
                onClicked: {
                    // For now, simulate customer onboarding completing
                    stateManager.handleCustomerEntered()
                }
            }
        }
    }
}
