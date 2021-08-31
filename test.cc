#include "co/co.h"
#include <iostream>

#if __cplusplus < 201402L

#endif

DEF_main(argc, argv) {
    co::Chan<int> ch;
    go([ch]() {
        ch << 7;
    });

    int v = 0;
    ch >> v;
    std::cout << "v: " << v << std::endl;

    return 0;
}