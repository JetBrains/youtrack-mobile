import {extractId} from './open-url-handler';

describe('open-url-handler', () => {

  it('should return NULL if URI is not provided', () => {
    const URI = '';

    expect(extractId(URI)).toEqual(null);
  });

  it('should extract issue id from a not encoded URI', () => {
    const URI = 'https://youtrack.jetbrains.com/issue/XX-1';

    expect(extractId(URI)).toEqual('XX-1');
  });

  it('should extract issue id from an encoded URI', () => {
    const URI = 'https://youtrack.jetbrains.com/oauth?state=%2Fissue%2FXX-1';

    expect(extractId(URI)).toEqual('XX-1');
  });

});
