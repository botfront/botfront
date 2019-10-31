import { Map, OrderedMap } from 'immutable';
import moment from 'moment';
import * as types from '../actions/types';

const startDate = moment().subtract(7, 'days');
const endDate = moment();

const initialState = Map({
    cardSettings: OrderedMap({
        conversationLengths: Map({
            visible: true,
            startDate,
            endDate,
            chartType: 'bar',
            valueType: 'absolute',
        }),
        intentFrequencies: Map({
            visible: true,
            startDate,
            endDate,
            chartType: 'bar',
            valueType: 'absolute',
        }),
        conversationDurations: Map({
            visible: true,
            startDate,
            endDate,
            chartType: 'bar',
            valueType: 'absolute',
        }),
        fallbackCounts: Map({
            visible: true,
            startDate,
            endDate,
            chartType: 'line',
            valueType: 'absolute',
        }),
        visitCounts: Map({
            visible: true,
            startDate,
            endDate,
            chartType: 'line',
            valueType: 'absolute',
        }),
    }),
});

export default function reducer(state = initialState, action) {
    switch (action.type) {
    case types.SWAP_ANALYTICS_CARDS:
        return state.update('cardSettings', (value) => {
            const { k1, k2 } = action;
            if (k1 === k2) return value;
            if (!value.get(k1) || !value.get(k2)) return value;
            return value.mapEntries(([k, v]) => {
                if (k === k1) return [k2, value.get(k2)];
                if (k === k2) return [k1, value.get(k1)];
                return [k, v];
            });
        });
    case types.SET_ANALYTICS_CARD_SETTINGS:
        return state.setIn(['cardSettings', action.cardId, action.setting], action.value);
    default:
        return state;
    }
}
