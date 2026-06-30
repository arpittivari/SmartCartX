import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import theme
import SmartCart 1.0

Item {
    id: root
    anchors.fill: parent
    Component.onCompleted: {
            // Yeh trigger hoga jaise hi CheckoutScreen load hogi
            shoppingService.clearCart();
        }
    Rectangle {
        anchors.fill: parent
        color: "#f4f6f9" // Premium Light Grey-Blue Background

        RowLayout {
            anchors.fill: parent
            anchors.margins: 25
            spacing: 25

            // ==========================================
            // LEFT COLUMN: Product Catalog (Mock Scanner)
            // ==========================================
            Rectangle {
                Layout.fillHeight: true
                Layout.fillWidth: true
                Layout.preferredWidth: 1
                color: "white"
                radius: 12
                border.color: "#e5e7eb"
                border.width: 1

                // Subtle Shadow Effect
                layer.enabled: true

                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: 25
                    spacing: 15

                    Text {
                        text: "Scan Items"
                        font.pixelSize: 24
                        font.bold: true
                        color: "#111827"
                    }

                    Text {
                        text: "Tap to simulate barcode scanning"
                        font.pixelSize: 14
                        color: "#6b7280"
                        Layout.topMargin: -10
                    }

                    Rectangle { Layout.fillWidth: true; height: 1; color: "#f3f4f6" } // Divider

                    ListView {
                        id: catalogView
                        Layout.fillHeight: true
                        Layout.fillWidth: true
                        model: shoppingService ? shoppingService.catalog.getAllProducts() : []
                        clip: true
                        spacing: 12

                        delegate: Rectangle {
                            width: catalogView.width
                            height: 70
                            color: "#ffffff"
                            radius: 8
                            border.color: "#f3f4f6"
                            border.width: 1

                            RowLayout {
                                anchors.fill: parent
                                anchors.margins: 15

                                ColumnLayout {
                                    spacing: 4
                                    Text {
                                        text: modelData.name
                                        font.pixelSize: 16
                                        font.bold: true
                                        color: "#1f2937"
                                        Layout.preferredWidth: 180
                                        elide: Text.ElideRight
                                    }
                                    Text {
                                        text: "₹" + modelData.price.toFixed(2)
                                        font.pixelSize: 15
                                        color: "#059669" // Premium Green for price
                                        font.bold: true
                                    }
                                }

                                Item { Layout.fillWidth: true }

                                Button {
                                    text: "+ Add"
                                    font.pixelSize: 14
                                    font.bold: true
                                    Layout.preferredWidth: 80
                                    Layout.preferredHeight: 40

                                    background: Rectangle {
                                        color: parent.down ? "#1d4ed8" : "#2563eb" // Bright Blue
                                        radius: 6
                                    }
                                    contentItem: Text {
                                        text: parent.text
                                        color: "white"
                                        horizontalAlignment: Text.AlignHCenter
                                        verticalAlignment: Text.AlignVCenter
                                        font: parent.font
                                    }

                                    onClicked: {
                                        if (shoppingService) shoppingService.addItem(modelData.sku)
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // ==========================================
            // RIGHT COLUMN: Active Shopping Cart
            // ==========================================
            Rectangle {
                Layout.fillHeight: true
                Layout.fillWidth: true
                Layout.preferredWidth: 1.2
                color: "white"
                radius: 12
                border.color: "#e5e7eb"
                border.width: 1
                layer.enabled: true

                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: 25
                    spacing: 15

                    Text {
                        text: "Current Cart"
                        font.pixelSize: 24
                        font.bold: true
                        color: "#111827"
                    }

                    Rectangle { Layout.fillWidth: true; height: 1; color: "#f3f4f6" }

                    ListView {
                        id: cartView
                        Layout.fillHeight: true
                        Layout.fillWidth: true
                        model: shoppingService ? shoppingService.cart : null
                        clip: true
                        spacing: 12

                        delegate: Rectangle {
                            width: cartView.width
                            height: 75
                            color: "#f9fafb" // Very light grey for cart items
                            radius: 8
                            border.color: "#e5e7eb"

                            RowLayout {
                                anchors.fill: parent
                                anchors.margins: 12
                                spacing: 15

                                // Item Name & Total Price
                                ColumnLayout {
                                    spacing: 4
                                    Layout.preferredWidth: 160
                                    Text {
                                        text: model.product.name
                                        font.pixelSize: 16
                                        font.bold: true
                                        color: "#1f2937"
                                        elide: Text.ElideRight
                                        Layout.fillWidth: true
                                    }
                                    Text {
                                        text: "₹" + model.totalPrice.toFixed(2)
                                        font.pixelSize: 15
                                        color: "#059669"
                                        font.bold: true
                                    }
                                }

                                Item { Layout.fillWidth: true }

                                // Quantity Controls
                                RowLayout {
                                    spacing: 5
                                    Button {
                                        text: "−"
                                        Layout.preferredWidth: 35; Layout.preferredHeight: 35
                                        background: Rectangle { color: "#e5e7eb"; radius: 6 }
                                        contentItem: Text { text: parent.text; font.pixelSize: 18; font.bold: true; horizontalAlignment: Text.AlignHCenter; verticalAlignment: Text.AlignVCenter }
                                        onClicked: if (shoppingService) shoppingService.updateQuantity(model.product.sku, model.quantity - 1)
                                    }

                                    Text {
                                        text: model.quantity
                                        font.pixelSize: 18
                                        font.bold: true
                                        color: "#111827"
                                        Layout.preferredWidth: 30
                                        horizontalAlignment: Text.AlignHCenter
                                    }

                                    Button {
                                        text: "+"
                                        Layout.preferredWidth: 35; Layout.preferredHeight: 35
                                        background: Rectangle { color: "#e5e7eb"; radius: 6 }
                                        contentItem: Text { text: parent.text; font.pixelSize: 18; font.bold: true; horizontalAlignment: Text.AlignHCenter; verticalAlignment: Text.AlignVCenter }
                                        onClicked: if (shoppingService) shoppingService.updateQuantity(model.product.sku, model.quantity + 1)
                                    }
                                }

                                // Remove Button
                                Button {
                                    text: "✕"
                                    Layout.preferredWidth: 40; Layout.preferredHeight: 40
                                    Layout.leftMargin: 10
                                    background: Rectangle { color: "#fee2e2"; radius: 6 } // Light Red
                                    contentItem: Text { text: parent.text; color: "#dc2626"; font.pixelSize: 16; font.bold: true; horizontalAlignment: Text.AlignHCenter; verticalAlignment: Text.AlignVCenter }
                                    onClicked: if (shoppingService) shoppingService.removeItem(model.product.sku)
                                }
                            }
                        }
                    }

                    // Cart Summary & Checkout
                    Rectangle {
                        Layout.fillWidth: true
                        height: 120
                        color: "#ffffff"

                        ColumnLayout {
                            anchors.fill: parent
                            spacing: 15

                            Rectangle { Layout.fillWidth: true; height: 2; color: "#e5e7eb" }

                            RowLayout {
                                Layout.fillWidth: true

                                ColumnLayout {
                                    Text { text: "Total Items: " + (shoppingService && shoppingService.cart ? shoppingService.cart.totalQuantity : 0); font.pixelSize: 15; color: "#6b7280" }
                                    Text { text: "Weight: " + (shoppingService && shoppingService.cart ? (shoppingService.cart.totalWeight / 1000).toFixed(2) : "0.00") + " kg"; font.pixelSize: 15; color: "#6b7280" }
                                }

                                Item { Layout.fillWidth: true }

                                ColumnLayout {
                                    Text { text: "Grand Total"; font.pixelSize: 14; color: "#6b7280"; Layout.alignment: Qt.AlignRight }
                                    Text {
                                        text: "₹" + (shoppingService && shoppingService.cart ? shoppingService.cart.totalPrice.toFixed(2) : "0.00")
                                        font.pixelSize: 28
                                        font.bold: true
                                        color: "#111827"
                                        Layout.alignment: Qt.AlignRight
                                    }
                                }
                            }

                            Button {
                                text: "Proceed to Checkout"
                                font.pixelSize: 18
                                font.bold: true
                                Layout.fillWidth: true
                                Layout.preferredHeight: 55

                                background: Rectangle {
                                    color: parent.down ? "#047857" : "#059669" // Premium Green
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
                                    stateManager.handleCheckoutRequested()
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}