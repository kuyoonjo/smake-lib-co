import * as index from '../src/index';

test('Should available', () => {
  expect(index.co_Darwin).toBeTruthy();
  expect(index.co_Linux).toBeTruthy();
  expect(index.co_Win32).toBeTruthy();
});
