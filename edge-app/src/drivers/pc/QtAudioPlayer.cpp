#include "QtAudioPlayer.h"
#include <QDebug>
#include <QUrl>

QtAudioPlayer::QtAudioPlayer(QObject* parent) : IAudioPlayer(parent) {
    setupSound(SoundEvent::BOOT_SOUND, "boot.wav");
    setupSound(SoundEvent::ITEM_ADDED, "item_added.wav");
    setupSound(SoundEvent::ITEM_REMOVED, "item_removed.wav");
    setupSound(SoundEvent::CHECKOUT, "checkout.wav");
    setupSound(SoundEvent::PAYMENT_SUCCESS, "payment_success.wav");
    setupSound(SoundEvent::ERROR_SOUND, "error.wav");
}

void QtAudioPlayer::setupSound(SoundEvent event, const QString& filename) {
    QSoundEffect* effect = new QSoundEffect(this);
    effect->setSource(QUrl("qrc:/SmartCart/sounds/" + filename));
    m_sounds[event] = effect;
}

void QtAudioPlayer::playSound(SoundEvent event) {
    if (m_sounds.contains(event)) {
        qDebug() << "[QtAudioPlayer] Playing sound event:" << static_cast<int>(event);
        m_sounds[event]->play();
    }
}