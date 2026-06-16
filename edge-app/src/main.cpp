#include <QGuiApplication>
#include <QQmlApplicationEngine>
#include <QQmlContext>
#include "core/AppContext.h"

int main(int argc, char *argv[])
{
    QGuiApplication app(argc, argv);

    AppContext context;

    QQmlApplicationEngine engine;
    
    engine.rootContext()->setContextProperty("stateManager", context.stateManager());
    engine.rootContext()->setContextProperty("provisioningService", context.provisioningService());
    engine.rootContext()->setContextProperty("debugController", context.debugController());

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