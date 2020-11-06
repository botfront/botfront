import React, { useMemo, useContext } from 'react';
import PropTypes from 'prop-types';
import { isEqual } from 'lodash';
import StoryVisualEditor from '../common/StoryVisualEditor';
import StoryErrorBoundary from '../StoryErrorBoundary';
import { ConversationOptionsContext } from '../Context';

const StoryDif = (props) => {
    const { actual, expected } = props;
    const { getResponseLocations } = useContext(
        ConversationOptionsContext,
    );

    const getBlocks = story => story.reduce((acc, current) => {
        const nextAcc = [...acc];
        if (current && (current.user || current.intent)) nextAcc[nextAcc.length] = [];
        nextAcc[nextAcc.length - 1].push(current);
        return nextAcc;
    }, []);

    const createMatchBlock = story => ({ type: 'match', story });

    const mergeEvents = (A, B) => {
        const expectedBlock = A;
        let actualBlock = B;
        const events = [];
        let currentDif;

        expectedBlock.forEach((expectedLine) => {
            const matchindex = actualBlock.findIndex(actualLine => (
                isEqual(actualLine, expectedLine)
            ));

            if (matchindex === 0) {
                // match is first element
                if (currentDif) {
                    events.push(currentDif);
                    currentDif = null;
                }
                events.push(createMatchBlock(expectedLine));
                actualBlock = actualBlock.slice(1);
            } else if (matchindex === -1) {
                // no match
                if (!currentDif) currentDif = { type: 'dif', expected: [], actual: [] };
                currentDif.expected.push(expectedLine);
            } else if (matchindex > 0) {
                // match is not the first element
                if (!currentDif) currentDif = { type: 'dif', expected: [], actual: [] };
                currentDif.actual = [...currentDif.actual, ...actualBlock.slice(0, matchindex)];
                events.push(currentDif);
                currentDif = null;
                actualBlock = actualBlock.slice(matchindex + 1, actualBlock.length);
                events.push(createMatchBlock(expectedLine));
            }
        });
        if (currentDif) {
            if (actualBlock.length > 0) {
                if (!currentDif) currentDif = { type: 'dif', expected: [], actual: [] };
                currentDif.actual = [...currentDif.actual, ...actualBlock];
            }
            events.push(currentDif);
        }

        return events;
    };

    const actualBlocks = useMemo(() => getBlocks(actual), [actual]);
    const expectedBlocks = useMemo(() => getBlocks(expected), [actual]);

    const mergedBlocks = expectedBlocks.map((expectedBlock, i) => mergeEvents(expectedBlock, actualBlocks[i]));

    const getVisualEditorClass = (type) => {
        if (type === 'expected') return 'valid';
        if (type === 'actual') return 'invalid';
        return '';
    };
    const renderBlock = (story, type) => (
        <div className='type'>
            <StoryVisualEditor
                onSave={() => {}}
                story={story}
                getResponseLocations={getResponseLocations}
                mode='test_case'
                className={getVisualEditorClass(type)}
            />
        </div>
    );

    const renderMerged = arrayOfEvents => arrayOfEvents.map((event) => {
        if (event.type === 'match') {
            return (
                renderBlock([event.story], 'match')
            );
        }
        if (event.type === 'dif') {
            return (
                <>
                    {event.expected.length > 0 ? renderBlock(event.expected, 'expected') : <div>EMPTY</div>}
                    {event.actual.length > 0 ? renderBlock(event.actual, 'actual') : <div>EMPTY</div>}
                </>
            );
        }
        return <div>NO TYPE</div>;
    });
    return (
        <StoryErrorBoundary>
            <>
                {mergedBlocks.map(block => renderMerged(block))}
            </>
        </StoryErrorBoundary>
    );
};

StoryDif.propTypes = {
    actual: PropTypes.array.isRequired,
    expected: PropTypes.array.isRequired,
};


export default StoryDif;
