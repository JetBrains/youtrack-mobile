import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);


beforeAll(async () => {
  await device.launchApp({
    delete: true,
    launchArgs: {
      detoxDebugVisibility: 'YES',
    },
  });
});
