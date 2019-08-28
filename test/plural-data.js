import { expect } from 'chai'
import cardinalData from 'cldr-core/supplemental/plurals.json'
import ordinalData from 'cldr-core/supplemental/ordinals.json'
import { identifier } from 'safe-identifier'

import MakePlural from 'make-plural-compiler/src/compiler'
import plurals from 'make-plural/plurals'

MakePlural.load(cardinalData, ordinalData)

function testPluralData(type, lc, getPlural) {
  var opt = { cardinals: type == 'cardinal', ordinals: type == 'ordinal' }

  it('has autogenerated tests', function() {
    const mpc = new MakePlural(lc, opt)
    expect(() => mpc.compile()).to.not.throw()
    expect(mpc.tests[type]).to.not.be.empty
  })

  it('is included in the output', function() {
    expect(getPlural(lc)).to.be.an.instanceOf(Function)
  })

  var mpc = new MakePlural(lc, opt)
  var mp = mpc.compile()
  for (var cat in mpc.tests[type]) {
    describe(
      cat + ': ' + MakePlural.rules[type][lc]['pluralRule-count-' + cat],
      function() {
        ;(function(cat) {
          it('Live data', function() {
            var test = mpc.tests.testCat.bind(mpc.tests)
            expect(() => test(type, cat, mp)).to.not.throw()
          })
          it('Output', function() {
            var test = mpc.tests.testCat.bind(mpc.tests)
            expect(() => test(type, cat, getPlural(lc))).to.not.throw()
          })
        })(cat)
      }
    )
  }
}

describe('MakePlural data self-test', () => {
  for (const [name, getPlural] of [
    ['UMD export', lc => plurals[identifier(lc)]]
  ]) {
    describe(name, () => {
      describe('Cardinal rules', () => {
        for (var lc in cardinalData.supplemental['plurals-type-cardinal']) {
          describe(lc, () => testPluralData('cardinal', lc, getPlural))
        }
      })

      describe('Ordinal rules', () => {
        for (var lc in ordinalData.supplemental['plurals-type-ordinal']) {
          describe(lc, () => testPluralData('ordinal', lc, getPlural))
        }
      })
    })
  }
})
