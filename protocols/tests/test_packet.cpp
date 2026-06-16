#include <gtest/gtest.h>
#include "packet.hpp"

using namespace SmartCart::Protocol;

TEST(PacketTest, BuilderTest) {
    uint8_t buffer[256];
    WeightPayload wp;
    wp.weight_grams = 150;
    
    size_t len = PacketBuilder::build(Command::CMD_WEIGHT_TELEMETRY, reinterpret_cast<const uint8_t*>(&wp), sizeof(wp), buffer, sizeof(buffer));
    
    EXPECT_GT(len, 0);
    EXPECT_EQ(buffer[0], 0xAA);
    EXPECT_EQ(buffer[1], 0x55);
    EXPECT_EQ(buffer[2], static_cast<uint8_t>(Command::CMD_WEIGHT_TELEMETRY));
    EXPECT_EQ(buffer[3], sizeof(wp));
    // Check little endian payload (150 = 0x96)
    EXPECT_EQ(buffer[4], 0x96); 
    EXPECT_EQ(buffer[5], 0x00);
}

TEST(PacketTest, ParserTest) {
    PacketParser parser;
    uint8_t buffer[256];
    
    BatteryPayload bp;
    bp.voltage_mv = 12000;
    bp.state_of_charge_pct = 85;
    bp.is_charging = 1;
    
    size_t len = PacketBuilder::build(Command::CMD_BATTERY_TELEMETRY, reinterpret_cast<const uint8_t*>(&bp), sizeof(bp), buffer, sizeof(buffer));
    
    // Feed partial
    parser.feed(buffer, 3);
    EXPECT_FALSE(parser.hasPacket());
    
    // Feed rest
    parser.feed(buffer + 3, len - 3);
    EXPECT_TRUE(parser.hasPacket());
    
    EXPECT_EQ(parser.getCommand(), Command::CMD_BATTERY_TELEMETRY);
    EXPECT_EQ(parser.getPayloadLength(), sizeof(bp));
    
    const BatteryPayload* parsed_bp = reinterpret_cast<const BatteryPayload*>(parser.getPayload());
    EXPECT_EQ(parsed_bp->voltage_mv, 12000);
    EXPECT_EQ(parsed_bp->state_of_charge_pct, 85);
    
    parser.consumePacket();
    EXPECT_FALSE(parser.hasPacket());
}

TEST(PacketTest, ParserCorruptionTest) {
    PacketParser parser;
    uint8_t buffer[256];
    
    BuzzerPayload bz;
    bz.pattern = 2;
    
    size_t len = PacketBuilder::build(Command::CMD_BUZZER_CONTROL, reinterpret_cast<const uint8_t*>(&bz), sizeof(bz), buffer, sizeof(buffer));
    
    // Corrupt the payload
    buffer[4] = 99; 
    
    parser.feed(buffer, len);
    
    // CRC should fail, packet should be dropped
    EXPECT_FALSE(parser.hasPacket());
}