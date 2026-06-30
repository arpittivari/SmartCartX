cmake_minimum_required(VERSION 3.16)
project(SmartCartProtocols VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_library(protocols STATIC
    src/packet.cpp
    src/crc16.cpp
)

target_include_directories(protocols PUBLIC
    $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/include>
    $<INSTALL_INTERFACE:include>
)

option(BUILD_TESTING "Build tests" OFF)

if(BUILD_TESTING)
    enable_testing()
    include(FetchContent)
    FetchContent_Declare(
      googletest
      URL https://github.com/google/googletest/archive/03597a01ee50ed33e9dfd640b249b4be3799d395.zip
    )
    set(gtest_force_shared_crt ON CACHE BOOL "" FORCE)
    FetchContent_MakeAvailable(googletest)

    add_executable(ProtocolTests
        tests/test_packet.cpp
        tests/test_crc16.cpp
    )
    target_link_libraries(ProtocolTests PRIVATE protocols GTest::gtest_main)
    
    include(GoogleTest)
    gtest_discover_tests(ProtocolTests)
endif()