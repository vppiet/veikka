import {describe, test} from '@jest/globals';

import {getLogger} from '../logger';

describe('logger module', () => {
    test('createLogger(): returns functioning logger', () => {
        const log = getLogger('logger.spec.ts');
        log.info('Hello world!');
    });
});
