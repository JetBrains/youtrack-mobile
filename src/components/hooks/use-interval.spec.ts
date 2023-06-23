import useInterval from './use-interval';
import {renderHook} from '@testing-library/react-hooks';


describe('useInterval Hook:', () => {
  const callback = jest.fn();

  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(() => {
    callback.mockRestore();
    jest.clearAllTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('should init hook', () => {
    jest.spyOn(global, 'setInterval');
    const {result} = renderHook(() => useInterval(callback, 1000));
    expect(result.current).toBeUndefined();
    expect(setInterval).toHaveBeenCalledTimes(1);
    expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 1000);
  });

  it('should repeatedly calls provided callback with a fixed time delay between each call', () => {
    renderHook(() => useInterval(callback, 200));
    expect(callback).not.toHaveBeenCalled();
    jest.advanceTimersByTime(199);
    expect(callback).not.toHaveBeenCalled();
    jest.advanceTimersToNextTimer(1);
    expect(callback).toHaveBeenCalledTimes(1);
    jest.advanceTimersToNextTimer();
    expect(callback).toHaveBeenCalledTimes(2);
    jest.advanceTimersToNextTimer(3);
    expect(callback).toHaveBeenCalledTimes(5);
  });

  it('should not call provided callback when delay is NULL', () => {
    renderHook(() => useInterval(callback, null));
    jest.advanceTimersToNextTimer(1);
    expect(callback).not.toHaveBeenCalledTimes(1);
    jest.advanceTimersToNextTimer();
    expect(callback).not.toHaveBeenCalledTimes(2);
  });
});
