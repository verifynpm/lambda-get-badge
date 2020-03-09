import { expect } from 'chai';

import { handler } from '.';

describe('badge', () => {
  it('works', async () => {
    // ARRANGE
    const packageVersion = 'redux@4.0.1';

    //event.pathParameters['packageVersion']
    const event = {
      pathParameters: { packageVersion },
    } as any;

    // ACT
    const result = await handler(event, null, null);

    // ASSERT
    console.log(result);
  });
});
