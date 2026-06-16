#ifndef STM32_BUTTON_INPUT_H
#define STM32_BUTTON_INPUT_H

#include "../interfaces/IButtonInput.h"

// Forward stub
class STM32ButtonInput : public IButtonInput {
    Q_OBJECT
public:
    explicit STM32ButtonInput(class SerialService* serialService, QObject* parent = nullptr);
    virtual ~STM32ButtonInput() = default;

private slots:
    void onPacketReceived(int cmd, const uint8_t* payload, uint8_t len);

private:
    class SerialService* m_serialService;
};

#endif