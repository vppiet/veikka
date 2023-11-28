import {describe, test, expect, beforeAll, mock, jest} from 'bun:test';
import {Database} from 'bun:sqlite';

import {NounTable} from '../../../db/noun';
import {Syllabificator} from '../textAnalysis';

mock.module('bun:sqlite', () => {
    return {Database: jest.fn()};
});

mock.module('../../../db/noun.ts', () => {
    return {
        NounTable: jest.fn(() => {
            return {
                getAllByBegin: {
                    all: jest.fn((word: string) => {
                        const rows = [
                            {word: 'ystävä'},
                            {word: 'eristys'},
                            {word: 'armahdus'},
                            {word: 'ero'},
                            {word: 'auto'},
                            {word: 'osa'},
                        ];
                        return rows.filter((r) => r.word.startsWith(word));
                    }),
                },
            };
        }),
    };
});

describe('textAnalysis', () => {
    let syllabificator: Syllabificator;
    let tableMock: NounTable;

    beforeAll(() => {
        tableMock = new NounTable(new Database());
        syllabificator = new Syllabificator(tableMock);
    });

    /*
    test cases mostly based on:
    - https://fi.wikipedia.org/wiki/Diftongi
    - https://kaino.kotus.fi/visk/sisallys.php?p=11
    - https://www.kielikello.fi/-/tavun-rajat
    - https://www.kielikello.fi/-/agronomi-mutta-aggressiivinen-konsonanttiyhtymista-
    ja-niiden-kirjoitusasusta
    */

    test('syllabificator.getSyllables(): diphthongs', () => {
        expect(syllabificator.getSyllables('suotta')).toEqual(['suot', 'ta']);
        expect(syllabificator.getSyllables('Suomi')).toEqual(['Suo', 'mi']);

        expect(syllabificator.getSyllables('Suomen')).toEqual(['Suo', 'men']);
        expect(syllabificator.getSyllables('kouluissa')).toEqual(['kou', 'luis', 'sa']);
        expect(syllabificator.getSyllables('hiukan')).toEqual(['hiu', 'kan']);
        expect(syllabificator.getSyllables('ihaillaan')).toEqual(['i', 'hail', 'laan']);
        expect(syllabificator.getSyllables('syksyisinä')).toEqual(['syk', 'syi', 'si', 'nä']);
        expect(syllabificator.getSyllables('työpäivinä')).toEqual(['työ', 'päi', 'vi', 'nä']);
        expect(syllabificator.getSyllables('meidän')).toEqual(['mei', 'dän']);
        expect(syllabificator.getSyllables('poikien')).toEqual(['poi', 'ki', 'en']);
        expect(syllabificator.getSyllables('höyläystöiden')).toEqual(['höy', 'läys', 'töi', 'den']);
        expect(syllabificator.getSyllables('kauneutta')).toEqual(['kau', 'neut', 'ta']);
    });

    test('syllabificator.getSyllables(): CV', () => {
        expect(syllabificator.getSyllables('jana')).toEqual(['ja', 'na']);
        expect(syllabificator.getSyllables('katosi')).toEqual(['ka', 'to', 'si']);
        expect(syllabificator.getSyllables('hedelmä')).toEqual(['he', 'del', 'mä']);
    });

    test('syllabificator.getSyllables(): CVC', () => {
        expect(syllabificator.getSyllables('kasku')).toEqual(['kas', 'ku']);
        expect(syllabificator.getSyllables('raskas')).toEqual(['ras', 'kas']);
        expect(syllabificator.getSyllables('raskaskulkuinen'))
            .toEqual(['ras', 'kas', 'kul', 'kui', 'nen']);
        expect(syllabificator.getSyllables('kasvit')).toEqual(['kas', 'vit']);
        expect(syllabificator.getSyllables('naapurusto')).toEqual(['naa', 'pu', 'rus', 'to']);
        expect(syllabificator.getSyllables('naapurit')).toEqual(['naa', 'pu', 'rit']);
    });

    test('syllabificator.getSyllables(): CVCC', () => {
        expect(syllabificator.getSyllables('myrsky')).toEqual(['myrs', 'ky']);
        expect(syllabificator.getSyllables('eversti')).toEqual(['e', 'vers', 'ti']);
        expect(syllabificator.getSyllables('luutnantti'))
            .toEqual(['luut', 'nant', 'ti']);
        expect(syllabificator.getSyllables('katafalkki')).toEqual(['ka', 'ta', 'falk', 'ki']);
    });

    test('syllabificator.getSyllables(): CVV', () => {
        expect(syllabificator.getSyllables('täi')).toEqual(['täi']);
        expect(syllabificator.getSyllables('vei')).toEqual(['vei']);
        expect(syllabificator.getSyllables('epäily')).toEqual(['e', 'päi', 'ly']);
        expect(syllabificator.getSyllables('antaa')).toEqual(['an', 'taa']);
        expect(syllabificator.getSyllables('eliksiiri')).toEqual(['e', 'lik', 'sii', 'ri']);
        expect(syllabificator.getSyllables('naapureita')).toEqual(['naa', 'pu', 'rei', 'ta']);
    });

    test('syllabificator.getSyllables(): CVVC', () => {
        expect(syllabificator.getSyllables('puusto')).toEqual(['puus', 'to']);
        expect(syllabificator.getSyllables('puista')).toEqual(['puis', 'ta']);
        expect(syllabificator.getSyllables('kokeilla')).toEqual(['ko', 'keil', 'la']);
        expect(syllabificator.getSyllables('avaruus')).toEqual(['a', 'va', 'ruus']);
        expect(syllabificator.getSyllables('avaruutta')).toEqual(['a', 'va', 'ruut', 'ta']);
    });

    test('syllabificator.getSyllables(): V', () => {
        expect(syllabificator.getSyllables('apu')).toEqual(['a', 'pu']);
        expect(syllabificator.getSyllables('säie')).toEqual(['säi', 'e']);
        expect(syllabificator.getSyllables('avoin')).toEqual(['a', 'voin']);
        expect(syllabificator.getSyllables('apu')).toEqual(['a', 'pu']);
        expect(syllabificator.getSyllables('eversti')).toEqual(['e', 'vers', 'ti']);
        expect(syllabificator.getSyllables('eliö')).toEqual(['e', 'li', 'ö']);
        expect(syllabificator.getSyllables('aikoa')).toEqual(['ai', 'ko', 'a']);
    });

    test('syllabificator.getSyllables(): VC', () => {
        expect(syllabificator.getSyllables('äsken')).toEqual(['äs', 'ken']);
        expect(syllabificator.getSyllables('kauan')).toEqual(['kau', 'an']);
        expect(syllabificator.getSyllables('apeus')).toEqual(['a', 'peus']);
    });

    test('syllabificator.getSyllables(): VCC', () => {
        expect(syllabificator.getSyllables('irstas')).toEqual(['irs', 'tas']);
        expect(syllabificator.getSyllables('aortta')).toEqual(['a', 'ort', 'ta']); // rare
        expect(syllabificator.getSyllables('variantti')).toEqual(['va', 'ri', 'ant', 'ti']); // rare
    });

    test('syllabificator.getSyllables(): VV', () => {
        expect(syllabificator.getSyllables('uoma')).toEqual(['uo', 'ma']);
        expect(syllabificator.getSyllables('kauaa')).toEqual(['kau', 'aa']);
        expect(syllabificator.getSyllables('vihreää')).toEqual(['vih', 're', 'ää']);
    });

    test('syllabificator.getSyllables(): CCV foreign', () => {
        expect(syllabificator.getSyllables('prosentti')).toEqual(['pro', 'sent', 'ti']);
        expect(syllabificator.getSyllables('ekstra')).toEqual(['eks', 'tra']);
        expect(syllabificator.getSyllables('katastrofi')).toEqual(['ka', 'tas', 'tro', 'fi']);
    });

    test('syllabificator.getSyllables(): CCVC foreign', () => {
        expect(syllabificator.getSyllables('trendi')).toEqual(['tren', 'di']);
        expect(syllabificator.getSyllables('abstrakti')).toEqual(['abs', 'trak', 'ti']);
    });

    test('syllabificator.getSyllables(): CCVCC foreign', () => {
        expect(syllabificator.getSyllables('flunssa')).toEqual(['fluns', 'sa']);
    });

    test('syllabificator.getSyllables(): CCVV foreign', () => {
        expect(syllabificator.getSyllables('klaava')).toEqual(['klaa', 'va']);
        expect(syllabificator.getSyllables('hamstraaja')).toEqual(['hams', 'traa', 'ja']);
        expect(syllabificator.getSyllables('demonstraatio'))
            .toEqual(['de', 'mons', 'traa', 'ti', 'o']);
    });

    test('syllabificator.getSyllables(): CCVVC foreign', () => {
        expect(syllabificator.getSyllables('kraatteri')).toEqual(['kraat', 'te', 'ri']);
        expect(syllabificator.getSyllables('maistraatti')).toEqual(['mais', 'traat', 'ti']);
        expect(syllabificator.getSyllables('orkestrointi')).toEqual(['or', 'kes', 'troin', 'ti']);
    });

    test('syllabificator.getSyllables(): sCCVVC foreign', () => {
        expect(syllabificator.getSyllables('stressi')).toEqual(['stres', 'si']);
    });

    test('syllabificator.getSyllables(): sCCVVC foreign', () => {
        expect(syllabificator.getSyllables('sprinkleri')).toEqual(['sprink', 'le', 'ri']);
    });

    test('syllabificator.getSyllables(): miscellaneous', () => {
        expect(syllabificator.getSyllables('kalja')).toEqual(['kal', 'ja']);
        expect(syllabificator.getSyllables('limppari')).toEqual(['limp', 'pa', 'ri']);
        expect(syllabificator.getSyllables('horisontti')).toEqual(['ho', 'ri', 'sont', 'ti']);
        expect(syllabificator.getSyllables('kauhea')).toEqual(['kau', 'he', 'a']);
        expect(syllabificator.getSyllables('ystävällinen'))
            .toEqual(['ys', 'tä', 'väl', 'li', 'nen']);
        expect(syllabificator.getSyllables('reitittää')).toEqual(['rei', 'tit', 'tää']);

        expect(syllabificator.getSyllables('etsiä')).toEqual(['et', 'si', 'ä']);
        expect(syllabificator.getSyllables('yksiö')).toEqual(['yk', 'si', 'ö']);
        expect(syllabificator.getSyllables('kielsi')).toEqual(['kiel', 'si']);
        expect(syllabificator.getSyllables('miniää')).toEqual(['mi', 'ni', 'ää']);
        expect(syllabificator.getSyllables('portti')).toEqual(['port', 'ti']);
        expect(syllabificator.getSyllables('yrtti')).toEqual(['yrt', 'ti']);
        expect(syllabificator.getSyllables('kaartui')).toEqual(['kaar', 'tui']);
        expect(syllabificator.getSyllables('jäädään')).toEqual(['jää', 'dään']);
        expect(syllabificator.getSyllables('äiti')).toEqual(['äi', 'ti']);
        expect(syllabificator.getSyllables('asu')).toEqual(['a', 'su']);
        expect(syllabificator.getSyllables('kehu')).toEqual(['ke', 'hu']);
        expect(syllabificator.getSyllables('myyrä')).toEqual(['myy', 'rä']);
        expect(syllabificator.getSyllables('säiliö')).toEqual(['säi', 'li', 'ö']);
        expect(syllabificator.getSyllables('appi')).toEqual(['ap', 'pi']);
        expect(syllabificator.getSyllables('käskyt')).toEqual(['käs', 'kyt']);
        expect(syllabificator.getSyllables('alttari')).toEqual(['alt', 'ta', 'ri']);
        expect(syllabificator.getSyllables('nuottaa')).toEqual(['nuot', 'taa']);
        expect(syllabificator.getSyllables('peitteessä')).toEqual(['peit', 'tees', 'sä']);

        expect(syllabificator.getSyllables('leyhyä')).toEqual(['ley', 'hy', 'ä']);
        expect(syllabificator.getSyllables('paperien')).toEqual(['pa', 'pe', 'ri', 'en']);
        expect(syllabificator.getSyllables('hygienia')).toEqual(['hy', 'gi', 'e', 'ni', 'a']);
        expect(syllabificator.getSyllables('vian')).toEqual(['vi', 'an']);
        expect(syllabificator.getSyllables('koala')).toEqual(['ko', 'a', 'la']);
        expect(syllabificator.getSyllables('dia')).toEqual(['di', 'a']);
        expect(syllabificator.getSyllables('korkea')).toEqual(['kor', 'ke', 'a']);
        expect(syllabificator.getSyllables('myllyä')).toEqual(['myl', 'ly', 'ä']);
        expect(syllabificator.getSyllables('pian')).toEqual(['pi', 'an']);
        expect(syllabificator.getSyllables('hion')).toEqual(['hi', 'on']);
        expect(syllabificator.getSyllables('hioin')).toEqual(['hi', 'oin']);
        expect(syllabificator.getSyllables('hioa')).toEqual(['hi', 'o', 'a']);
        expect(syllabificator.getSyllables('rae')).toEqual(['ra', 'e']);
        expect(syllabificator.getSyllables('koe')).toEqual(['ko', 'e']);
        expect(syllabificator.getSyllables('aie')).toEqual(['ai', 'e']);
        expect(syllabificator.getSyllables('raot')).toEqual(['ra', 'ot']);
        expect(syllabificator.getSyllables('teos')).toEqual(['te', 'os']);
        expect(syllabificator.getSyllables('teollisuus')).toEqual(['te', 'ol', 'li', 'suus']);
        expect(syllabificator.getSyllables('piano')).toEqual(['pi', 'a', 'no']);
        expect(syllabificator.getSyllables('biologi')).toEqual(['bi', 'o', 'lo', 'gi']);
        expect(syllabificator.getSyllables('geometria')).toEqual(['ge', 'o', 'met', 'ri', 'a']);
        expect(syllabificator.getSyllables('maestro')).toEqual(['ma', 'est', 'ro']);
        expect(syllabificator.getSyllables('teatteri')).toEqual(['te', 'at', 'te', 'ri']);
        expect(syllabificator.getSyllables('Leo')).toEqual(['Le', 'o']);
        expect(syllabificator.getSyllables('Joel')).toEqual(['Jo', 'el']);
        expect(syllabificator.getSyllables('vapaaehtoinen'))
            .toEqual(['va', 'paa', 'eh', 'toi', 'nen']);
        expect(syllabificator.getSyllables('korkeafrekvenssinen'))
            .toEqual(['kor', 'ke', 'a', 'frek', 'vens', 'si', 'nen']);
        expect(syllabificator.getSyllables('matalafrekvenssinen'))
            .toEqual(['ma', 'ta', 'la', 'frek', 'vens', 'si', 'nen']);
        expect(syllabificator.getSyllables('ekspatriaatti'))
            .toEqual(['eks', 'pat', 'ri', 'aat', 'ti']);
        expect(syllabificator.getSyllables('aate')).toEqual(['aa', 'te']);
        expect(syllabificator.getSyllables('aatteidensa')).toEqual(['aat', 'tei', 'den', 'sa']);
        expect(syllabificator.getSyllables('aatteellinen')).toEqual(['aat', 'teel', 'li', 'nen']);
        expect(syllabificator.getSyllables('lääketiede')).toEqual(['lää', 'ke', 'tie', 'de']);
        expect(syllabificator.getSyllables('aurinko')).toEqual(['au', 'rin', 'ko']);
        expect(syllabificator.getSyllables('ruusukoristeinen'))
            .toEqual(['ruu', 'su', 'ko', 'ris', 'tei', 'nen']);
        expect(syllabificator.getSyllables('anestesia')).toEqual(['a', 'nes', 'te', 'si', 'a']);
        expect(syllabificator.getSyllables('ajallaan')).toEqual(['a', 'jal', 'laan']);
        expect(syllabificator.getSyllables('eristysaika')).toEqual(['e', 'ris', 'tys', 'ai', 'ka']);
        expect(syllabificator.getSyllables('eristysajan')).toEqual(['e', 'ris', 'tys', 'a', 'jan']);
        expect(syllabificator.getSyllables('armahdusanomus'))
            .toEqual(['ar', 'mah', 'dus', 'a', 'no', 'mus']);

        expect(syllabificator.getSyllables('erottaa')).toEqual(['e', 'rot', 'taa']);

        expect(syllabificator.getSyllables('auto')).toEqual(['au', 'to']);
        expect(syllabificator.getSyllables('auton')).toEqual(['au', 'ton']);
        expect(syllabificator.getSyllables('autoa')).toEqual(['au', 'to', 'a']);
        expect(syllabificator.getSyllables('autoon')).toEqual(['au', 'toon']);
        expect(syllabificator.getSyllables('autot')).toEqual(['au', 'tot']);
        expect(syllabificator.getSyllables('autojen')).toEqual(['au', 'to', 'jen']);
        expect(syllabificator.getSyllables('autot')).toEqual(['au', 'tot']);
        expect(syllabificator.getSyllables('autoja')).toEqual(['au', 'to', 'ja']);
        expect(syllabificator.getSyllables('autoihin')).toEqual(['au', 'toi', 'hin']);
        expect(syllabificator.getSyllables('autotta')).toEqual(['au', 'tot', 'ta']);
        expect(syllabificator.getSyllables('autoitta')).toEqual(['au', 'toit', 'ta']);
        expect(syllabificator.getSyllables('autoritäärinen'))
            .toEqual(['au', 'to', 'ri', 'tää', 'ri', 'nen']);
        expect(syllabificator.getSyllables('elektroni')).toEqual(['e', 'lek', 'tro', 'ni']);
        expect(syllabificator.getSyllables('osaa')).toEqual(['o', 'saa']);
        expect(syllabificator.getSyllables('osaava')).toEqual(['o', 'saa', 'va']);
        expect(syllabificator.getSyllables('osaavainen')).toEqual(['o', 'saa', 'vai', 'nen']);
        expect(syllabificator.getSyllables('osata')).toEqual(['o', 'sa', 'ta']);
        expect(syllabificator.getSyllables('kaljuileva')).toEqual(['kal', 'jui', 'le', 'va']);
        expect(syllabificator.getSyllables('halkeamaisillaan'))
            .toEqual(['hal', 'ke', 'a', 'mai', 'sil', 'laan']);
    });

    test('syllabificator.getSyllables(): non-alphabet separated segments', () => {
        expect(syllabificator.getSyllables('vaa\'an')).toEqual(['vaa', 'an']);
        expect(syllabificator.getSyllables('i\'issä')).toEqual(['i', 'is', 'sä']);
        expect(syllabificator.getSyllables('ala-aste')).toEqual(['a', 'la', 'as', 'te']);
    });
});
