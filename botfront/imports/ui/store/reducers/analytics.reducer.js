import { Map, OrderedMap, List } from 'immutable';
import moment from 'moment';
import * as types from '../actions/types';

const startDate = moment().subtract(6, 'days').startOf('day');
const endDate = moment().endOf('day');

const initialState = Map({
    analyticsLanguages: List([]),
    cardSettings: OrderedMap({
        visitCounts: Map({
            visible: true,
            startDate,
            endDate,
            chartType: 'line',
            valueType: 'absolute',
        }),
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
            exclude: List(['get_started']),
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
            responses: List(['action_botfront_fallback']),
        }),
    }),
});

export default function reducer(state = initialState, action) {
    let { value: newValue } = action;
    if (Array.isArray(newValue)) newValue = List(newValue);
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
        return state.setIn(['cardSettings', action.cardId, action.setting], newValue);
    case types.SET_ANALYTICS_LANGUAGES:
        return state.set('analyticsLanguages', List(action.languages));
    default:
        return state;
    }
}
