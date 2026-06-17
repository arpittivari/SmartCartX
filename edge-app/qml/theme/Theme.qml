pragma Singleton
import QtQuick

QtObject {
    readonly property color primaryDarkBlue: "#1A2530" // Dark Blue
    readonly property color primaryWhite: "#FFFFFF"     // White
    readonly property color primaryLightGray: "#F5F6FA" // Light Gray
    readonly property color accentColor: "#3498DB"      // Additional for buttons, etc if needed
    readonly property color textColor: "#333333"

    readonly property string fontFamily: "Helvetica, Arial, sans-serif"

    readonly property int spacingSmall: 8
    readonly property int spacingMedium: 16
    readonly property int spacingLarge: 32

    readonly property int fontSizeSmall: 14
    readonly property int fontSizeMedium: 18
    readonly property int fontSizeLarge: 24
    readonly property int fontSizeTitle: 32
}
