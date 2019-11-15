import { expect } from 'chai';
import moment from 'moment';
import { calculateTemporalBuckets, getDataToDisplayAndParamsToUse } from './graphs';


if (Meteor.isClient) {
    describe('temporal nBuckets', function () {
        it('change tick number with card size', function () {
            let tickValues;
            let nBuckets;
            const startDate = moment().subtract(3, 'd');
            const endDate = moment();

            ({ tickValues, nBuckets } = calculateTemporalBuckets(endDate, startDate));
            expect(tickValues).to.be.equal(3);
            expect(nBuckets).to.be.equal(3);
            ({ tickValues, nBuckets } = calculateTemporalBuckets(endDate, startDate, 'wide'));
            expect(tickValues).to.be.equal(21);
            expect(nBuckets).to.be.equal(72);
        });

        it('change tick number with time span', function () {
            let tickValues;
            let nBuckets;
            let startDate = moment().subtract(4, 'd');
            let endDate = moment();
            ({ tickValues, nBuckets } = calculateTemporalBuckets(endDate, startDate));
            expect(tickValues).to.be.equal(4);
            expect(nBuckets).to.be.equal(4);

            startDate = moment().subtract(10, 'd');
            endDate = moment();
            ({ tickValues, nBuckets } = calculateTemporalBuckets(endDate, startDate));
            expect(tickValues).to.be.equal(7);
            expect(nBuckets).to.be.equal(10);

            startDate = moment().subtract(100, 'd');
            endDate = moment();
            ({ tickValues, nBuckets } = calculateTemporalBuckets(endDate, startDate));
            expect(tickValues).to.be.equal(7);
            expect(nBuckets).to.be.equal(14);
        });
    });

    describe('graph params', function () {
        const data = { dummy: [{ bucket: '123' }] };
        const queryParams = { queryName: 'dummy', temporal: true };
        const graphParams = {};
        const tickValues = 3;
        const valueType = 'dummy';
        it('change tick format with card size', function () {
            let paramsToUse;
            const startDate = moment().subtract(3, 'd');
            const endDate = moment();
            ({ paramsToUse } = getDataToDisplayAndParamsToUse({
                data, queryParams, graphParams, tickValues, valueType, startDate, endDate, size: 'wide',
            }));
            expect(paramsToUse.axisBottom.format).to.be.equal('%H:%M');
            ({ paramsToUse } = getDataToDisplayAndParamsToUse({
                data, queryParams, graphParams, tickValues, valueType, startDate, endDate,
            }));
            expect(paramsToUse.axisBottom.format).to.be.equal('%d/%m');
        });

        it('change tick format with time span', function () {
            let paramsToUse;
            let startDate = moment().subtract(1, 'd');
            const endDate = moment();

            ({ paramsToUse } = getDataToDisplayAndParamsToUse({
                data, queryParams, graphParams, tickValues, valueType, startDate, endDate,
            }));
            expect(paramsToUse.axisBottom.format).to.be.equal('%H:%M');

            startDate = moment().subtract(3, 'd');
            ({ paramsToUse } = getDataToDisplayAndParamsToUse({
                data, queryParams, graphParams, tickValues, valueType, startDate, endDate,
            }));

            startDate = moment().subtract(10, 'd');
            expect(paramsToUse.axisBottom.format).to.be.equal('%d/%m');
            ({ paramsToUse } = getDataToDisplayAndParamsToUse({
                data, queryParams, graphParams, tickValues, valueType, startDate, endDate,
            }));
        });
    });
}
