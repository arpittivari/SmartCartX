import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import QtMultimedia

Rectangle {
    id: root
    color: "#f8f9fa"

    // Sound Effect: Ensure "sounds/success.wav" exists in your project path
    SoundEffect {
        id: successSound
        // Apne computer ka poora path yahan likho, example:
        source: "file:///C:/Users/arpit/Desktop/SmartCartX-main/SmartCartX-main/edge-app/sounds/success.wav"
        volume: 1.0
    }

    Component.onCompleted: {
        // GHOST CART FIX: Screen load hote hi state verify karo
        if (typeof shoppingService !== "undefined") {
            // Optional: Agar cart khali hai toh previous history clean karo
            // shoppingService.clearCart();
        }
    }

    RowLayout {
        anchors.fill: parent
        anchors.margins: 40
        spacing: 40

        // ==========================================
        // LEFT COLUMN: Cart Items Summary
        // ==========================================
        Rectangle {
            Layout.fillHeight: true
            Layout.fillWidth: true
            Layout.preferredWidth: 2
            color: "white"
            radius: 12
            border.color: "#e0e0e0"
            border.width: 1

            ColumnLayout {
                anchors.fill: parent
                anchors.margins: 30
                spacing: 15

                Text {
                    text: "Order Summary"
                    font.pixelSize: 26
                    font.bold: true
                    color: "#222222"
                }

                Rectangle { Layout.fillWidth: true; height: 1; color: "#eeeeee" }

                ListView {
                    id: cartList
                    Layout.fillWidth: true
                    Layout.fillHeight: true
                    clip: true
                    spacing: 20
                    // Make sure model is bound to your actual C++ backend
                    model: shoppingService.cart

                    delegate: Item {
                        width: cartList.width
                        height: 40
                        RowLayout {
                            anchors.fill: parent
                            Text { text: model.quantity + "x"; font.bold: true; font.pixelSize: 18; color: "#0078D7" }
                            Text { text: model.name; Layout.fillWidth: true; font.pixelSize: 18; color: "#555555"; Layout.leftMargin: 10 }
                            Text { text: "₹" + model.price; font.bold: true; font.pixelSize: 18; color: "#222222" }
                        }
                    }
                }
            }
        }

        // ==========================================
        // RIGHT COLUMN: Payment Details
        // ==========================================
        Rectangle {
            Layout.fillHeight: true
            Layout.fillWidth: true
            Layout.preferredWidth: 1.2
            color: "white"
            radius: 12
            border.color: "#e0e0e0"
            border.width: 1

            ColumnLayout {
                anchors.fill: parent
                anchors.margins: 30
                spacing: 20

                Text {
                    text: "Payment Details"
                    font.pixelSize: 26
                    font.bold: true
                    color: "#222222"
                }

                Item { Layout.fillHeight: true }

                // Payment Button
                Button {
                    id: payButton
                    text: "Proceed to Pay"
                    font.pixelSize: 20
                    font.bold: true
                    Layout.fillWidth: true
                    Layout.preferredHeight: 65

                    background: Rectangle {
                        color: payButton.down ? "#218838" : (payButton.enabled ? "#28a745" : "#6c757d")
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
                        payButton.text = "Processing..."
                        payButton.enabled = false

                        // Sound Play
                        successSound.play()

                        // Payment Complete Logic
                        mockPaymentTimer.start()
                    }
                }

                Timer {
                    id: mockPaymentTimer
                    interval: 2000
                    onTriggered: {
                        // PAYMENT KE BAAD CART SAAPH KARO
                        shoppingService.clearCart();
                        stackView.replace("PaymentCompleteScreen.qml")
                    }
                }
            }
        }
    }
}