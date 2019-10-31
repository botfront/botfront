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
            const [i, j] = [action.i, action.j].sort(); // i <= j
            if (i === j) return value; // i < j
            const [iVal, jVal] = [value.get(i), value.get(j)];
            return value
                .splice(i, 1, jVal)
                .splice(j, 1, iVal);
        });
    case types.SET_ANALYTICS_CARD_SETTINGS:
        return state.setIn(['cardSettings', action.cardId, action.setting], action.value);
    default:
        return state;
    }
}
