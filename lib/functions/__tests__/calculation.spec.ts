import {describe, test, expect} from 'bun:test';
import {calculate, lexer} from '../calculation';

describe('calculate', () => {
    test('lexer simple', () => {
        expect(lexer('2*4+5-10+2/3')).toEqual({
            tokens: [2, 4, '*', 5, '+', 10, '-', 2, 3, '/', '+'],
        });
    });

    test('lexer complex', () => {
        expect(lexer('3+4*2/(1-5)^2^3')).toEqual({
            tokens: [3, 4, 2, '*', 1, 5, '-', 2, 3, '^', '^', '/', '+'],
        });
    });

    test('lexer floating 1', () => {
        expect(lexer('1.23')).toEqual({tokens: [1.23]});
    });

    test('lexer floating 2', () => {
        expect(lexer('3+1.23')).toEqual({tokens: [3, 1.23, '+']});
    });

    test('calculate simple', () => {
        expect(calculate('4+2*1+3-1')).toEqual({result: 8});
    });

    test('calculate complex 1', () => {
        expect(calculate('(20-3)*2+4^2-1')).toEqual({result: 49});
    });

    test('calculate complex 2', () => {
        expect(calculate('3^(3-1)/(6/2)').result).toBe(3);
    });

    test('calculate floating', () => {
        expect(calculate('(1/1.3)*0.321').result).toBeCloseTo(0.2469, 4);
    });
});
