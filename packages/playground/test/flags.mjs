import { equal, deepEqual } from 'assert';

import { FLAGS, readFlags, setValue, setValues, setSwitch, warningsOf } from '../app/modules/flagsSchema.mjs';

const DEFAULTS = [
  'graphBuildMode(standard_af).',
  'statementLabellingMode(statement).',
  'argumentLabellingMode(grounded).',
  'orderingPrinciple(last).',
  'orderingComparator(elitist).',
  'graphExtension(standardPref).',
  'queryMode.',
].join('\n');

describe('Flags', function () {

  it('should read every kind of flag', function () {
    const state = readFlags(DEFAULTS + "\ngraphExtension(bp).\nmodulesPath('https://example.org/t').");
    equal(state.argumentLabellingMode, 'grounded');
    deepEqual(state.graphExtension, ['standardPref', 'bp']);
    equal(state.queryMode, true);
    equal(state.autoTransposition, false);
    equal(state.modulesPath, 'https://example.org/t');
  });

  it('should tolerate spaces and comments', function () {
    const state = readFlags('  argumentLabellingMode( preferred ) . % the semantics\n queryMode . % fast');
    equal(state.argumentLabellingMode, 'preferred');
    equal(state.queryMode, true);
  });

  it('should change a value in place', function () {
    const text = setValue(DEFAULTS, 'argumentLabellingMode', 'stable');
    equal(text.split('\n')[2], 'argumentLabellingMode(stable).');
    equal(text.split('\n').length, DEFAULTS.split('\n').length);
  });

  it('should add a missing value at the end, and drop an emptied one', function () {
    const added = setValue('queryMode.', 'modulesPath', 'https://example.org/t');
    equal(added, "queryMode.\nmodulesPath('https://example.org/t').\n");
    equal(setValue(added, 'modulesPath', ''), 'queryMode.\n');
  });

  it('should set the values of a repeated flag where the first one was', function () {
    const text = setValues(DEFAULTS, 'graphExtension', ['standardPref', 'rebutRestriction']);
    deepEqual(readFlags(text).graphExtension, ['standardPref', 'rebutRestriction']);
    equal(text.split('\n')[5], 'graphExtension(standardPref).');
    equal(text.split('\n')[6], 'graphExtension(rebutRestriction).');
    deepEqual(readFlags(setValues(text, 'graphExtension', [])).graphExtension, []);
  });

  it('should turn switches on and off', function () {
    const on = setSwitch(DEFAULTS, 'autoTransposition', true);
    equal(readFlags(on).autoTransposition, true);
    const off = setSwitch(on, 'queryMode', false);
    equal(readFlags(off).queryMode, false);
    equal(off.includes('queryMode'), false);
  });

  it('should keep the lines it does not know', function () {
    const text = setValue('% my flags\ncustomFlag(x).\n' + DEFAULTS, 'orderingPrinciple', 'weakest');
    equal(text.startsWith('% my flags\ncustomFlag(x).\n'), true);
  });

  it('should warn about missing required flags and the normal/weakest pair', function () {
    deepEqual(warningsOf(readFlags(DEFAULTS)), []);
    const missing = warningsOf(readFlags(setValue(DEFAULTS, 'orderingPrinciple', null)));
    equal(missing.length, 1);
    const clash = setValue(setValue(DEFAULTS, 'orderingPrinciple', 'weakest'), 'orderingComparator', 'normal');
    equal(warningsOf(readFlags(clash)).length, 1);
  });

  it('should describe every documented flag', function () {
    deepEqual(FLAGS.map(it => it.name).sort(), [
      'argumentLabellingMode', 'autoTransposition', 'debug', 'graphBuildMode', 'graphExtension', 'metaConflicts',
      'metaRules', 'modulesPath', 'naturalTerms', 'orderingComparator', 'orderingPrinciple',
      'prologStrictCompatibility', 'queryMode', 'statementLabellingMode'
    ]);
  });
});
