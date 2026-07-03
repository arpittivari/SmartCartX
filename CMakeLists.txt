cmake_minimum_required(VERSION 3.16)
project(SmartCartX VERSION 1.0.0 LANGUAGES CXX)

option(BUILD_TESTING "Build tests" OFF)
if(BUILD_TESTING)
    enable_testing()
endif()

# Edge-App CMakeLists.txt already adds protocols, so we only need to add Edge-App
add_subdirectory(Edge-App)
