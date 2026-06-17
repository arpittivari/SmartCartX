#include <QGuiApplication>
#include <QQmlApplicationEngine>
#include <QQmlContext>
#include "core/AppContext.h"

int main(int argc, char *argv[])
{
    qputenv("QT_IM_MODULE", QByteArray("qtvirtualkeyboard"));

    QGuiApplication app(argc, argv);

    AppContext context;

    QQmlApplicationEngine engine;
    
    // Add QML import path for theme
    engine.addImportPath("qrc:/SmartCart/qml/");

    engine.rootContext()->setContextProperty("stateManager", context.stateManager());
    engine.rootContext()->setContextProperty("provisioningService", context.provisioningService());
    engine.rootContext()->setContextProperty("debugController", context.debugController());
    engine.rootContext()->setContextProperty("shoppingService", context.shoppingService());

    const QUrl url(u"qrc:/SmartCart/qml/Main.qml"_qs);
    QObject::connect(&engine, &QQmlApplicationEngine::objectCreated,
        &app, [url, &context](QObject *obj, const QUrl &objUrl) {
            if (!obj && url == objUrl) {
                QCoreApplication::exit(-1);
            } else {
                // Initialize context once UI loads
                context.initialize();
            }
        }, Qt::QueuedConnection);
    engine.load(url);

    return app.exec();
}
