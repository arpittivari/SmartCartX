#ifndef QT_AUDIO_PLAYER_H
#define QT_AUDIO_PLAYER_H

#include "../interfaces/IAudioPlayer.h"
#include <QSoundEffect>
#include <QMap>

class QtAudioPlayer : public IAudioPlayer {
    Q_OBJECT
public:
    explicit QtAudioPlayer(QObject* parent = nullptr);
    virtual ~QtAudioPlayer() = default;

public slots:
    void playSound(SoundEvent event) override;

private:
    void setupSound(SoundEvent event, const QString& filename);
    QMap<SoundEvent, QSoundEffect*> m_sounds;
};

#endif