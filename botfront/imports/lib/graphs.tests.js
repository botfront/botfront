import { expect } from 'chai';
import moment from 'moment';
import { calculateTemporalBuckets, getDataToDisplayAndParamsToUse } from './graphs';


if (Meteor.isClient) {
    describe('temporal nBuckets', function () {
        it('change tick number with card size', function () {
            let nTicks;
            let nBuckets;
            const startDate = moment().subtract(3, 'd');
            const endDate = moment();

            ({ nTicks, nBuckets } = calculateTemporalBuckets(startDate, endDate));
            expect(nTicks).to.be.equal(3);
            expect(nBuckets).to.be.equal(3);
            ({ nTicks, nBuckets } = calculateTemporalBuckets(startDate, endDate, _, 'wide'));
            expect(nTicks).to.be.equal(12);
            expect(nBuckets).to.be.equal(24);
        });

        it('change tick number with time span', function () {
            let nTicks;
            let nBuckets;
            let startDate = moment().subtract(4, 'd');
            let endDate = moment();
            ({ nTicks, nBuckets } = calculateTemporalBuckets(startDate, endDate));
            expect(nTicks).to.be.equal(4);
            expect(nBuckets).to.be.equal(4);

            startDate = moment().subtract(10, 'd');
            endDate = moment();
            ({ nTicks, nBuckets } = calculateTemporalBuckets(startDate, endDate));
            expect(nTicks).to.be.equal(7);
            expect(nBuckets).to.be.equal(10);

            startDate = moment().subtract(100, 'd');
            endDate = moment();
            ({ nTicks, nBuckets } = calculateTemporalBuckets(startDate, endDate));
            expect(nTicks).to.be.equal(7);
            expect(nBuckets).to.be.equal(14);
        });
    });

    describe('graph params', function () {
        const data = { dummy: [{ bucket: '123' }] };
        const queryParams = { queryName: 'dummy', temporal: true };
        const graphParams = {};
        const valueType = 'dummy';
        const projectTimezoneOffset = 0;
        it('change tick format with card size', function () {
            let paramsToUse;
            const startDate = moment().subtract(3, 'd');
            const endDate = moment();
            let nTicks;
            let bucketSize;
            ({ nTicks, bucketSize } = calculateTemporalBuckets(startDate, endDate, _, 'wide'));
            ({ paramsToUse } = getDataToDisplayAndParamsToUse({
                data, queryParams, graphParams, valueType, bucketSize, nTicks, projectTimezoneOffset, size: 'wide',
            }));
            expect(paramsToUse.axisBottom.format).to.be.equal('%H:%M');

            ({ nTicks, bucketSize } = calculateTemporalBuckets(startDate, endDate, _));
            ({ paramsToUse } = getDataToDisplayAndParamsToUse({
                data, queryParams, graphParams, valueType, bucketSize, nTicks, projectTimezoneOffset,
            }));
            expect(paramsToUse.axisBottom.format).to.be.equal('%d/%m');
        });

        it('change tick format with time span', function () {
            let paramsToUse;
            let startDate = moment().subtract(1, 'd');
            const endDate = moment();
            let nTicks;
            let bucketSize;
            ({ nTicks, bucketSize } = calculateTemporalBuckets(startDate, endDate));
            ({ paramsToUse } = getDataToDisplayAndParamsToUse({
                data, queryParams, graphParams, valueType, bucketSize, nTicks, projectTimezoneOffset,
            }));
            expect(paramsToUse.axisBottom.format).to.be.equal('%H:%M');

            startDate = moment().subtract(10, 'd');
            ({ nTicks, bucketSize } = calculateTemporalBuckets(startDate, endDate));
            ({ paramsToUse } = getDataToDisplayAndParamsToUse({
                data, queryParams, graphParams, valueType, bucketSize, nTicks, projectTimezoneOffset,
            }));
            expect(paramsToUse.axisBottom.format).to.be.equal('%d/%m');
        });
    });
}
