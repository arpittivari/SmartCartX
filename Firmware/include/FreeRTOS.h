#ifndef FREERTOS_STUBS_H
#define FREERTOS_STUBS_H

#include <stdint.h>
#include <stddef.h>

#define pdMS_TO_TICKS(x) (x)
#define tskIDLE_PRIORITY 0
#define configMAX_PRIORITIES 7

typedef void (*TaskFunction_t)( void * );

#ifdef __cplusplus
extern "C" {
#endif

void vTaskDelay(uint32_t ticks);
void xTaskCreate(TaskFunction_t pxTaskCode, const char * const pcName, const uint16_t usStackDepth, void * const pvParameters, uint32_t uxPriority, void * pxCreatedTask);
void vTaskStartScheduler(void);

#ifdef __cplusplus
}
#endif

#endif // FREERTOS_STUBS_H