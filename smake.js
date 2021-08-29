const { addFrameworks } = require('@smake/libs');
const { LLVM_Darwin} = require('smake');
const { co_Darwin } = require('./lib');

class co_darwin_x86_64 extends co_Darwin {
  ar = 'ar';
}

class test extends LLVM_Darwin {
  files = ['test.cc'];
  cxxflags = [
    ...super.cxxflags,
    '-std=c++17',
  ];
}

module.exports = {
  targets: [
    co_darwin_x86_64,
    addFrameworks(test, co_darwin_x86_64),
  ],
};
