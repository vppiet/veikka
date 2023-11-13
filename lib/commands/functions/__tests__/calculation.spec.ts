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

    test('lexer symbol 1', () => {
        expect(lexer('pi')).toEqual({tokens: [Math.PI]});
    });

    test('lexer symbol 2', () => {
        expect(lexer('e+3')).toEqual({tokens: [Math.E, 3, '+']});
    });

    test('lexer invalid symbol', () => {
        expect(lexer('pii')).toHaveProperty('error');
    });

    test('calculate simple', () => {
        expect(calculate('4+2*1+3-1')).toEqual({result: 8});
    });

    test('calculate complex 1', () => {
        expect(calculate('(20-3)*2+4^2-1')).toEqual({result: 49});
    });

    test('calculate complex 2', () => {
        expect(calculate('3^(3-1)/(6/2)')).toEqual({result: 3});
    });

    test('calculate floating', () => {
        expect(calculate('(1/1.3)*0.321').result).toBeCloseTo(0.2469, 4);
    });

    test('calculate symbol', () => {
        expect(calculate('2*pi')).toEqual({result: 2 * Math.PI});
    });
});
