#include "IBatteryMonitor.h"
#include "IWeightSensor.h"
#include "IBarcodeScanner.h"
#include "IButtonInput.h"
#include "ICamera.h"
#include "IAudioPlayer.h"

IBatteryMonitor::IBatteryMonitor(QObject* parent) : QObject(parent) {}
IBatteryMonitor::~IBatteryMonitor() = default;

IWeightSensor::IWeightSensor(QObject* parent) : QObject(parent) {}
IWeightSensor::~IWeightSensor() = default;

IBarcodeScanner::IBarcodeScanner(QObject* parent) : QObject(parent) {}
IBarcodeScanner::~IBarcodeScanner() = default;

IButtonInput::IButtonInput(QObject* parent) : QObject(parent) {}
IButtonInput::~IButtonInput() = default;

ICamera::ICamera(QObject* parent) : QObject(parent) {}
ICamera::~ICamera() = default;

IAudioPlayer::IAudioPlayer(QObject* parent) : QObject(parent) {}
IAudioPlayer::~IAudioPlayer() = default;
