import { TimingPipe } from './timing.pipe';

describe('TimingPipe', () => {
  const pipe = new TimingPipe();
  it('formats milliseconds and seconds', () => {
    expect(pipe.transform(450)).toBe('450 ms');
    expect(pipe.transform(2500)).toBe('2.5 s');
  });
  it('returns an empty string when there is no value', () => {
    expect(pipe.transform(undefined)).toBe('');
  });
});
