jest.mock('react-native-keychain', () => ({
    setGenericPassword: jest.fn(),
    getGenericPassword: jest.fn(async () => false),
    resetGenericPassword: jest.fn(),
    ACCESSIBLE: { WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'AccessibleWhenUnlockedThisDeviceOnly' },
  }));
  
  jest.mock('@notifee/react-native', () => ({
    requestPermission: jest.fn(async () => ({ authorizationStatus: 1 })),
    createChannel: jest.fn(async () => 'signal-priority'),
    displayNotification: jest.fn(),
    createTriggerNotification: jest.fn(),
    cancelNotification: jest.fn(),
    onForegroundEvent: jest.fn(() => () => {}),
    getInitialNotification: jest.fn(async () => null),
    EventType: { PRESS: 1 },
    AuthorizationStatus: { AUTHORIZED: 1 },
    AndroidImportance: { HIGH: 4 },
    TriggerType: { TIMESTAMP: 0 },
  }));