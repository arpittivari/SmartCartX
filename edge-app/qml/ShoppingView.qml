import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import theme
import SmartCart 1.0

Item {
    id: root

    Rectangle {
        anchors.fill: parent
        color: Theme.primaryLightGray

        RowLayout {
            anchors.fill: parent
            anchors.margins: Theme.spacingMedium
            spacing: Theme.spacingMedium

            // Product Catalog View (Left)
            Rectangle {
                Layout.fillHeight: true
                Layout.preferredWidth: parent.width * 0.5
                color: Theme.primaryWhite
                radius: 8

                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: Theme.spacingMedium

                    Text {
                        text: "Product Catalog (Mock Scanner)"
                        font.pixelSize: Theme.fontSizeLarge
                        font.bold: true
                        color: Theme.primaryDarkBlue
                    }

                    ListView {
                        id: catalogView
                        Layout.fillHeight: true
                        Layout.fillWidth: true
                        model: shoppingService ? shoppingService.catalog.getAllProducts() : []
                        clip: true

                        delegate: ItemDelegate {
                            width: catalogView.width
                            height: 60

                            RowLayout {
                                anchors.fill: parent
                                anchors.margins: Theme.spacingSmall

                                Text {
                                    text: modelData.name
                                    font.pixelSize: Theme.fontSizeMedium
                                    font.bold: true
                                    Layout.preferredWidth: 150
                                }
                                Text {
                                    text: "$" + modelData.price.toFixed(2)
                                    font.pixelSize: Theme.fontSizeMedium
                                    color: Theme.accentColor
                                }
                                Item { Layout.fillWidth: true }
                                Button {
                                    text: "Simulate Scan"
                                    onClicked: {
                                        if (shoppingService) shoppingService.addItem(modelData.sku)
                                    }
                                }
                            }

                            Rectangle {
                                anchors.bottom: parent.bottom
                                width: parent.width
                                height: 1
                                color: Theme.primaryLightGray
                            }
                        }
                    }
                }
            }

            // Shopping Cart View (Right)
            Rectangle {
                Layout.fillHeight: true
                Layout.fillWidth: true
                color: Theme.primaryWhite
                radius: 8

                ColumnLayout {
                    anchors.fill: parent
                    anchors.margins: Theme.spacingMedium

                    Text {
                        text: "Your Cart"
                        font.pixelSize: Theme.fontSizeLarge
                        font.bold: true
                        color: Theme.primaryDarkBlue
                    }

                    ListView {
                        id: cartView
                        Layout.fillHeight: true
                        Layout.fillWidth: true
                        model: shoppingService ? shoppingService.cart : null
                        clip: true

                        delegate: ItemDelegate {
                            width: cartView.width
                            height: 60

                            RowLayout {
                                anchors.fill: parent
                                anchors.margins: Theme.spacingSmall

                                Text {
                                    text: model.product.name
                                    font.pixelSize: Theme.fontSizeMedium
                                    font.bold: true
                                    Layout.preferredWidth: 120
                                }
                                Text {
                                    text: "x" + model.quantity
                                    font.pixelSize: Theme.fontSizeMedium
                                    Layout.preferredWidth: 50
                                }
                                Text {
                                    text: "$" + model.totalPrice.toFixed(2)
                                    font.pixelSize: Theme.fontSizeMedium
                                    color: Theme.accentColor
                                }
                                Item { Layout.fillWidth: true }
                                Button {
                                    text: "-"
                                    onClicked: {
                                        if (shoppingService) shoppingService.updateQuantity(model.product.sku, model.quantity - 1)
                                    }
                                }
                                Button {
                                    text: "+"
                                    onClicked: {
                                        if (shoppingService) shoppingService.updateQuantity(model.product.sku, model.quantity + 1)
                                    }
                                }
                                Button {
                                    text: "Remove"
                                    onClicked: {
                                        if (shoppingService) shoppingService.removeItem(model.product.sku)
                                    }
                                }
                            }

                            Rectangle {
                                anchors.bottom: parent.bottom
                                width: parent.width
                                height: 1
                                color: Theme.primaryLightGray
                            }
                        }
                    }

                    Rectangle {
                        Layout.fillWidth: true
                        height: 2
                        color: Theme.primaryDarkBlue
                        Layout.topMargin: Theme.spacingSmall
                        Layout.bottomMargin: Theme.spacingSmall
                    }

                    RowLayout {
                        Layout.fillWidth: true

                        ColumnLayout {
                            Text {
                                text: "Items: " + (shoppingService && shoppingService.cart ? shoppingService.cart.totalQuantity : 0)
                                font.pixelSize: Theme.fontSizeMedium
                            }
                            Text {
                                text: "Weight: " + (shoppingService && shoppingService.cart ? (shoppingService.cart.totalWeight / 1000).toFixed(2) : "0.00") + " kg"
                                font.pixelSize: Theme.fontSizeMedium
                            }
                        }

                        Item { Layout.fillWidth: true }

                        Text {
                            text: "Total: $" + (shoppingService && shoppingService.cart ? shoppingService.cart.totalPrice.toFixed(2) : "0.00")
                            font.pixelSize: Theme.fontSizeTitle
                            font.bold: true
                            color: Theme.primaryDarkBlue
                        }
                    }

                    Button {
                        Layout.fillWidth: true
                        Layout.preferredHeight: 60
                        text: "Proceed to Checkout"
                        font.pixelSize: Theme.fontSizeLarge
                        font.bold: true
                        onClicked: {
                            stateManager.handleCheckoutRequested()
                        }
                    }
                }
            }
        }
    }
}
