import Conversations from '../conversations.model';
import { trackerDateRangeStage } from './utils';


const convertToEvent = (name) => {
    if (name.startsWith('action_') || name.startsWith('utter_')) {
        return { event: 'action', name };
    }
    return { event: 'user', 'parse_data.intent.name': name };
};


/*
convert this shape
[
        { count: 2, stepsMatched: 2 },
        { count: 1, stepsMatched: 4 }
]
to
[ 3, 3, 1, 1 ]

in the array the is no data for stepsMatched 1 and 3
this function infer the value for those steps while reshaping the array
*/
const fillVoidsAndReshape = (results, sequence) => {
    // count how many tracker were matched during the aggregation
    const sequenceLen = sequence.length;
    const totalNumberOfTrackers = results.reduce((sum, currentResults) => sum + currentResults.count, 0);
    if (totalNumberOfTrackers === 0) return [];

    let trackersLeft = totalNumberOfTrackers;
    const resultsWithoutVoids = [];
    let resultIndex = 0;
    // fill the array resultsWithoutVoids
    for (let i = 0; i < sequenceLen; i += 1) {
        const { stepsMatched, count } = results[resultIndex] || {};
        // we add _i to the end of each name so we ensure it's unique
        const name = sequence[i].excluded ? `NOT ${sequence[i].name}_${i}` : `${sequence[i].name}_${i}`;
        // step that was not matched so we push to resultsWithoutVoids
        if (!stepsMatched || !count) {
            resultsWithoutVoids.push({
                matchCount: 0, name, proportion: 0,
            });
            // step that was  matched so we push numberOfTrackers to resultsWithoutVoids
        } else if (stepsMatched - 1 === i) {
            resultsWithoutVoids.push({
                matchCount: trackersLeft, name, proportion: (trackersLeft / totalNumberOfTrackers * 100).toFixed(2),
            });
            // decrement the number of tracker that were matching until this step
            trackersLeft -= count;
            // since we took care of this element we look for the next one in the results
            resultIndex += 1;
        } else {
            // push the previous number of tracker if we do not have informations for this step
            resultsWithoutVoids.push({
                matchCount: trackersLeft, name, proportion: (trackersLeft / totalNumberOfTrackers * 100).toFixed(2),
            });
        }
    }
    return resultsWithoutVoids;
};


export const checkIfVariableIsAMatch = variableToTest => (
    {
        /* we test out if $$nextToMatch matches, that you mean we successfully avoided the $$toMatch
    e.g: trackerstore= [A,B,C,D] sequence= [A,[D],C] nested value means not match
    so trackerstore[1] is not D, and the next match, so D have been avoided and we can continue the matching
    process
    */
        $and: [
            /*
             since the to match element is based on the size of value
            if the sequence is matched until the last event,
            the access of sequence based on the size of value will give us a null as an out of range value
            by ensuring that the size of value is less than the size of the sequence
            we will not try to compare null
            */
            { $lt: ['$$sizeVal', '$$sizeSeq'] },
            { $ne: ['STOP', { $arrayElemAt: ['$$value', -1] }] }, // If stop is the last element we do not continue to match
            {
                $or: [
                    { $eq: ['$$this.name', variableToTest] }, // test for action
                    { $eq: ['$$this.parse_data.intent.name', variableToTest] }], // test for intent
            }],
    }
);

export const reshapeSequence = sequence => sequence.map((step) => {
    if (step.excluded) {
        return [step.name];
    }
    return step.name;
});


export const countMatchesPerConversation = inputArray => ({
    $addFields: {
        matching: {
            /* in reduce :
                $$this is the current element
                $$value is the accumulator
                */
            $reduce: {
                input: inputArray, // filtered tracker store
                initialValue: [],
                in: {
                    $let: {
                        vars: {
                            sizeSeq: { $size: '$sequence' },
                            sizeVal: { $size: '$$value' },
                            toMatch: { $arrayElemAt: ['$sequence', { $size: '$$value' }] },
                            nextToMatch: { $arrayElemAt: ['$sequence', { $add: [{ $size: '$$value' }, 1] }] },
                        },
                        in: {
                            $cond: {
                                if: { $isArray: ['$$toMatch'] }, // a array value mean that we want to exclude this value
                                then: {
                                    $cond: {
                                        if: {
                                            /* Check if the current value does  match $$toMatch
                                                    */
                                            $or: [
                                                { $eq: ['$$this.name', { $arrayElemAt: ['$$toMatch', 0] }] }, // test for action
                                                { $eq: ['$$this.parse_data.intent.name', { $arrayElemAt: ['$$toMatch', 0] }] }, // test for intent
                                            ],
                                        },
                                        then: { $concatArrays: ['$$value', ['STOP']] }, // we found the value we wanted to avoid so we add STOP to the array
                                        else: {
                                            $cond: {
                                                if: {
                                                    /* Check if we are evaluating for the end of the sequence
                                                        */
                                                    $and: [
                                                        { $eq: [{ $add: ['$$sizeVal', 1] }, '$$sizeSeq'] },
                                                        { $ne: ['STOP', { $arrayElemAt: ['$$value', -1] }] }, // If stop is the last element we do not continue to match
                                                    ],
                                                },
                                                then: {
                                                    $cond: {
                                                        if: { $eq: ['$$this', 'END'] }, // check if we reached the end
                                                        then: { $concatArrays: ['$$value', ['$$toMatch']] },
                                                        else: '$$value',
                                                    },
                                                },
                                                else: {
                                                    $cond: {
                                                        if: checkIfVariableIsAMatch('$$nextToMatch'),
                                                        then: { $concatArrays: ['$$value', ['$$toMatch', '$$nextToMatch']] }, // we also add next to match since it was matched
                                                        else: '$$value',
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                                else: {
                                    $cond: {
                                        if: checkIfVariableIsAMatch('$$toMatch'),
                                        then: { $concatArrays: ['$$value', ['$$toMatch']] },
                                        else: '$$value',
                                    },
                                },

                            },
                        },
                    },
                },

            },
        },
    },
});


export const getConversationsFunnel = async ({
    projectId,
    selectedSequence,
    from,
    to,
    langs,
    envs,
}) => {
    if (selectedSequence.length === 0) { return []; }
    const reshapedSequence = reshapeSequence(selectedSequence);
    const aggregation = [
        {
            $match: {
                projectId,
                ...(envs ? { env: { $in: envs } } : {}),
                ...(langs && langs.length ? { language: { $in: langs } } : {}),
            },
        },
        ...trackerDateRangeStage(from, to),
        // we filter all documents that do not have at least the first event in their events list
        {
            $match: {
                'tracker.events': { $elemMatch: convertToEvent(reshapedSequence[0]) },
            },
        },
        {
            $project: {
                eventsFiltered: { $concatArrays: ['$tracker.events', ['END']] },
                sequence: reshapedSequence,
            },
        },
        // that part check the order of the elements in the sequence, and store then in a dedicated field if they match
        countMatchesPerConversation('$eventsFiltered'),
       
        // remove the STOP used in the matching array
        {
            $set: {
                matching: {
                    $filter: { input: '$matching', cond: { $ne: ['$$this', 'STOP'] } },
                },
            },
        },
        // compute how many step each tracker store has matched
        {
            $project: {
                _id: 0,
                stepsMatched: { $size: '$matching' },
            },
        },
        // group tracker store by number of step matched and also count them
        {
            $group: {
                _id: '$stepsMatched',
                count: { $sum: 1 },
            },
        },
        // renaming step so data make more sense, because group create an id field
        {
            $project: {
                stepsMatched: '$_id',
                count: 1,
                _id: 0,
            },
        },
        // sort so the  we go from 0 setps matched to max step matched
        {
            $sort: {
                stepsMatched: 1,
            },
        },
    ];

    // in the end the aggregation give something with this shape
    /*
    [
        { count: 2, stepsMatched: 2 },
        { count: 1, stepsMatched: 4 }
    ]
    it read like so :
    2 tracker store matched until step 2 of sequence
    1 tracker store matched until step 4 of sequence
    */
    const arregationResult = await Conversations.aggregate(aggregation).allowDiskUse(true);
    return (fillVoidsAndReshape(arregationResult, selectedSequence));
};
