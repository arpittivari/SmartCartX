#include "FreeRTOS.h"

void vTaskDelay(uint32_t ticks) {}
void xTaskCreate(TaskFunction_t pxTaskCode, const char * const pcName, const uint16_t usStackDepth, void * const pvParameters, uint32_t uxPriority, void * pxCreatedTask) {}
void vTaskStartScheduler(void) {}