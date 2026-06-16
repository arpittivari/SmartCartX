#ifndef IBUTTON_INPUT_H
#define IBUTTON_INPUT_H

#include <QObject>

class IButtonInput : public QObject {
    Q_OBJECT
public:
    explicit IButtonInput(QObject* parent = nullptr) : QObject(parent) {}
    virtual ~IButtonInput() = default;

signals:
    void buttonPressed(int buttonId);
};

#endif