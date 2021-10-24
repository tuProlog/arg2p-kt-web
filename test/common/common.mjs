import { expect } from 'chai';

import { tuprolog } from '../../app/common.js';

export function suite() {

    it('should fail', function (done) {
        function throwsWithNoArgs() {
            tuprolog.theory.parsing.parseAsTheory(' mother_child(trude, sally)')
        }
        expect(throwsWithNoArgs).to.throw
        done()
    });
}