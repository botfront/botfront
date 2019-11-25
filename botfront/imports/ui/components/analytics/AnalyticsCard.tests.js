import { expect } from 'chai';
import moment from 'moment';
import { applyTimezoneOffset } from '../../../lib/graphs';


if (Meteor.isClient) {
    describe('DatePicker timezone offset', () => {
        it('should correctly apply an positive offset', () => {
            const date = moment.utc('2013-02-08 23:59');
            const offset = 3;
            const offsetedDate = applyTimezoneOffset(date, offset);
            expect(offsetedDate.format()).to.equal('2013-02-08T23:59:00+03:00');
        });

        it('should correctly apply an negative offset', () => {
            const date = moment.utc('2013-02-08 23:59');
            const offset = -3;
            const offsetedDate = applyTimezoneOffset(date, offset);
            expect(offsetedDate.format()).to.equal('2013-02-08T23:59:00-03:00');
        });
    });
}
