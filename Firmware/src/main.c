#include "stm32f4xx_hal.h"
#include "FreeRTOS.h"
#include "task.h"
#include "tasks.h"

void SystemClock_Config(void) {}
void Error_Handler(void) { while(1) {} }

int main(void) {
    HAL_Init();
    SystemClock_Config();
    InitTasks();
    vTaskStartScheduler();
    while (1) {}
}