const { addFrameworks } = require('@smake/libs');
const { sync } = require('glob');
const { LLVM_Darwin, LLVM_Linux, LLVM_Win32 } = require('smake');
const { co_Darwin, co_Linux, co_Win32 } = require('./lib');
const { basename } = require('path');

process.env.SMAKE_LLVM_SYSROOT_X86_64_LINUX_GNU = '/opt/sysroots/ubuntu18.04-gcc11-x86_64-linux-gnu';
process.env.SMAKE_LLVM_SYSROOT_AARCH64_LINUX_GNU = '/opt/sysroots/ubuntu18.04-gcc11-aarch64-linux-gnu';
process.env.SMAKE_LLVM_SYSROOT_ARM_LINUX_GNUEABIHF = '/opt/sysroots/ubuntu18.04-gcc11-arm-linux-gnueabihf';

class co_darwin_arm64 extends co_Darwin {
  prefix = '';
  ar = 'ar';
  ARCH = 'arm64';
}

class darwinArm64Unitest extends LLVM_Darwin {
  prefix = '';
  ARCH = 'arm64';
  files = sync('co/unitest/**/*.cc');
  cxxflags = [
    ...super.cxxflags,
    '-std=c++17',
  ];
  outputFilename = 'darwin/arm64/unitest';
}

const darwinArm64Tests = sync('co/test/**/*.cc').map(p => {
  const name = basename(p).replace('.cc', '');
  const c = addFrameworks(class extends LLVM_Darwin {
    prefix = '';
    ARCH = 'arm64';
    files = [p];
    cxxflags = [
      ...super.cxxflags,
      '-std=c++17',
    ];
    outputFilename = 'darwin/arm64/' + name;
  }, co_darwin_arm64);

  Object.defineProperty(c, 'name', {
    value: 'darwin_arm64_' + name,
    configurable: true,
  });
  return c;
});

class co_linux_arm64 extends co_Linux {
  target = 'aarch64-linux-gnu';
}


class co_linux_arm extends co_Linux {
  target = 'arm-linux-gnueabihf';
}

class co_linux_x86_64 extends co_Linux {
  target = 'x86_64-linux-gnu';
}

const linuxTests = [
  co_linux_arm64,
  co_linux_arm,
  co_linux_x86_64,
].map(Class => {
  const c = new Class();
  const t = c.target;

  const ut = addFrameworks(class extends LLVM_Linux {
    target = t;
    files = sync('co/unitest/**/*.cc');
    cxxflags = [
      ...super.cxxflags,
      '-std=c++17',
    ];
    ldflags = [
      ...super.ldflags,
      '-static-libstdc++',
    ];
    outputFilename = 'linux/' + t + '/unitest';
  },
    Class);
  Object.defineProperty(ut, 'name', {
    value: t + '_unitest',
    configurable: true,
  });
  return [
    ut,
    ...sync('co/test/**/*.cc').map(p => {
      const name = basename(p).replace('.cc', '');
      const tt = addFrameworks(class extends LLVM_Linux {
        target = t;
        files = [p];
        cxxflags = [
          ...super.cxxflags,
          '-std=c++17',
        ];
        ldflags = [
          ...super.ldflags,
          '-static-libstdc++',
        ];
        outputFilename = 'linux/' + t + '/' + name;
      }, Class);

      Object.defineProperty(tt, 'name', {
        value: t + '_' + name,
        configurable: true,
      });
      return tt;
    }),
  ];
})
  .reduce((a, b) => a.concat(b));

class co_win32_x86_64 extends co_Win32 {
  ARCH = 'x86_64';
}

class win64Unitest extends LLVM_Win32 {
  ARCH = 'x86_64';
  files = sync('co/unitest/**/*.cc');
  cxxflags = [
    ...super.cxxflags,
    '-std=c++17',
  ];
  outputFilename = 'win32/x86_64/unitest.exe';
}

const win64Tests = sync('co/test/**/*.cc').map(p => {
  const name = basename(p).replace('.cc', '');
  const c = addFrameworks(class extends LLVM_Win32 {
    ARCH = 'x86_64';
    files = [p];
    cxxflags = [
      ...super.cxxflags,
      '-std=c++17',
    ];
    outputFilename = 'win32/x86_64/' + name + '.exe';
  }, co_win32_x86_64);

  Object.defineProperty(c, 'name', {
    value: 'win32_x86_64_' + name,
    configurable: true,
  });
  return c;
});


class co_win32_i386 extends co_Win32 {
  ARCH = 'i386';
}

class win32Unitest extends LLVM_Win32 {
  useLldLink = true;
  ARCH = 'i386';
  files = sync('co/unitest/**/*.cc');
  cxxflags = [
    ...super.cxxflags,
    '-std=c++17',
  ];
  ldflags = [
    ...super.ldflags,
    '/SAFESEH:NO',
  ];
  outputFilename = 'win32/i386/unitest.exe';
}

const win32Tests = sync('co/test/**/*.cc').map(p => {
  const name = basename(p).replace('.cc', '');
  const c = addFrameworks(class extends LLVM_Win32 {
    useLldLink = true;
    ARCH = 'i386';
    files = [p];
    cxxflags = [
      ...super.cxxflags,
      '-std=c++17',
    ];

    ldflags = [
      ...super.ldflags,
      '/SAFESEH:NO',
    ];
    outputFilename = 'win32/i386/' + name + '.exe';
  }, co_win32_i386);

  Object.defineProperty(c, 'name', {
    value: 'win32_i386_' + name,
    configurable: true,
  });
  return c;
});

module.exports = {
  targets: [
    co_darwin_arm64,
    addFrameworks(darwinArm64Unitest, co_darwin_arm64),
    ...darwinArm64Tests,
    co_linux_arm64,
    co_linux_arm,
    co_linux_x86_64,
    ...linuxTests,
    co_win32_x86_64,
    addFrameworks(win64Unitest, co_win32_x86_64),
    ...win64Tests,
    co_win32_i386,
    addFrameworks(win32Unitest, co_win32_i386),
    ...win32Tests,
  ],
};
