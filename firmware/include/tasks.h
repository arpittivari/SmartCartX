#ifndef FIRMWARE_TASKS_H
#define FIRMWARE_TASKS_H

#ifdef __cplusplus
extern "C" {
#endif

void UartTask(void *pvParameters);
void WeightTask(void *pvParameters);
void BatteryTask(void *pvParameters);
void LedTask(void *pvParameters);
void WatchdogTask(void *pvParameters);

void InitTasks(void);

#ifdef __cplusplus
}
#endif

#endif // FIRMWARE_TASKS_H