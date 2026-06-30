#ifndef SIMULATED_BUTTON_INPUT_H
#define SIMULATED_BUTTON_INPUT_H

#include "../interfaces/IButtonInput.h"
#include <QTimer>

class SimulatedButtonInput : public IButtonInput {
    Q_OBJECT
public:
    explicit SimulatedButtonInput(QObject* parent = nullptr);

public slots:
    void startMocking();
    void stopMocking();

private slots:
    void onButtonTick();

private:
    QTimer* m_timer;
};

#endif