import { sync } from 'glob';
import { resolve } from 'path';
import { LLVM, LLVM_Darwin } from 'smake';
import { Framework } from '@smake/libs';

export class co_Darwin extends LLVM_Darwin implements Framework {
  get type() {
    return 'static' as any;
  }

  get includedirs() {
    return [
      ...super.includedirs,
      resolve(__dirname, '..', 'co/include').replace(/\\/g, '/'),
    ];
  }
  get files() {
    return [
      ...sync(
        resolve(__dirname, '..', 'co/src').replace(/\\/g, '/') +
          '/**/!(*_win|epoll|iocp).cc'
      ),
      resolve(__dirname, '..', 'co/src/co/context/context.S').replace(
        /\\/g,
        '/'
      ),
    ];
  }
  get cxxflags() {
    return [
      ...super.cxxflags,
      '-D_FILE_OFFSET_BITS=64',
      '-std=c++17',
      '-fno-pie',
      '-fvisibility=hidden',
      '-fvisibility-inlines-hidden',
    ];
  }

  framework(t: LLVM) {
    const r = new RegExp('/' + t.outputFilename + '$');
    const d = t.outputPath.replace(r, '');

    Object.defineProperty(t, 'sysIncludedirs', {
      value: [
        ...t.sysIncludedirs,
        resolve(__dirname, '..', 'co', 'include').replace(/\\/g, '/'),
      ],
      configurable: true,
    });
    Object.defineProperty(t, 'libs', {
      value: [...t.libs, this.outputFileBasename],
      configurable: true,
    });
    Object.defineProperty(t, 'linkdirs', {
      value: [...t.linkdirs, d],
      configurable: true,
    });
  }
}
