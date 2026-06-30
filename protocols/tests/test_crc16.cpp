#include <gtest/gtest.h>
#include "crc16.hpp"

using namespace SmartCart::Protocol;

TEST(CRC16Test, BasicCalculation) {
    uint8_t data[] = {0x12, 0x34, 0x56, 0x78};
    uint16_t crc = CRC16::calculate(data, sizeof(data));
    EXPECT_GT(crc, 0); 
}