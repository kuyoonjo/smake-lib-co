import { sync } from 'glob';
import { resolve } from 'path';
import { LLVM, LLVM_Win32 } from 'smake';
import { Framework } from '@smake/libs';

export class co_Win32 extends LLVM_Win32 implements Framework {
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
          '/**/!(epoll|kqueue).cc'
      ),
      resolve(__dirname, '..', 'co/src/__/StackWalker.cpp').replace(/\\/g, '/'),
      resolve(__dirname, '..', 'co/src/co/detours/creatwth.cpp').replace(
        /\\/g,
        '/'
      ),
      resolve(__dirname, '..', 'co/src/co/detours/detours.cpp').replace(
        /\\/g,
        '/'
      ),
      resolve(__dirname, '..', 'co/src/co/detours/image.cpp').replace(
        /\\/g,
        '/'
      ),
      resolve(__dirname, '..', 'co/src/co/detours/modules.cpp').replace(
        /\\/g,
        '/'
      ),
      resolve(__dirname, '..', 'co/src/co/detours/disasm.cpp').replace(
        /\\/g,
        '/'
      ),
      resolve(__dirname, '..', 'co/src/co/context/context.S').replace(
        /\\/g,
        '/'
      ),
      // resolve(
      //   __dirname,
      //   '..',
      //   'co/src/co/context/' +
      //     (this.ARCH === 'x86_64' ? 'context_x64.asm' : 'context_x86.asm')
      // ).replace(/\\/g, '/'),
    ];
  }
  get cxxflags() {
    return [
      ...super.cxxflags,
      '-DWIN32_LEAN_AND_MEAN',
      '-D_WINSOCK_DEPRECATED_NO_WARNINGS',
      '-std=c++17',
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
