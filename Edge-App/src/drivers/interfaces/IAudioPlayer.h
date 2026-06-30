#ifndef IAUDIO_PLAYER_H
#define IAUDIO_PLAYER_H

#include <QObject>
#include <QString>

enum class SoundEvent {
    BOOT_SOUND,
    ITEM_ADDED,
    ITEM_REMOVED,
    CHECKOUT,
    PAYMENT_SUCCESS,
    ERROR_SOUND
};

class IAudioPlayer : public QObject {
    Q_OBJECT
public:
    explicit IAudioPlayer(QObject* parent = nullptr);
    virtual ~IAudioPlayer();

public slots:
    virtual void playSound(SoundEvent event) = 0;
};

#endif
