import React, { useMemo, useContext } from 'react';
import PropTypes from 'prop-types';
import { isEqual } from 'lodash';
import { Divider } from 'semantic-ui-react';
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
        if (current && current.user) nextAcc[nextAcc.length] = [];
        nextAcc[nextAcc.length - 1].push(current);
        return nextAcc;
    }, []);

    const createMatchBlock = story => ({ type: 'match', story });

    const mergeEvents = (A, B) => {
        let expectedBlock = A;
        let actualBlock = B;
        const events = [];
        let currentDif;

        if (isEqual(expectedBlock[0], actualBlock[0])) {
            events.push(createMatchBlock(expectedBlock[0]));
            expectedBlock = expectedBlock.slice(1);
            actualBlock = actualBlock.slice(1);
        }

        expectedBlock.forEach((expectedLine) => {
            const matchindex = actualBlock.findIndex(actualLine => (
                isEqual(actualLine, expectedLine)
            ));

            if (matchindex !== -1) {
            // if there is a match add the current dif to the events
                // followed by the matched line
                if (currentDif) {
                    events.push(currentDif);
                    currentDif = null;
                }
                events.push(createMatchBlock(expectedLine));
            }

            if (matchindex === 0) {
                // match is first element
                actualBlock = actualBlock.slice(1);
            } else if (matchindex === -1) {
                // no match
                if (!currentDif) currentDif = { type: 'dif', expected: [], actual: [] };
                currentDif.expected.push(expectedLine);
            } else if (matchindex > 0) {
                // match is not the first element
                if (!currentDif) currentDif = { type: 'dif', expected: [], actual: [] };
                currentDif.actual.push(actualBlock.slice(0, matchindex));
                actualBlock = actualBlock.slice(matchindex + 1, actualBlock.length);
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

    const renderBlock = (story, type) => (
        <div className='type'>
            {type ? (
                <Divider
                    horizontal
                    content={type}
                />
            ) : (
                <Divider />
            )}
            <StoryVisualEditor
                onSave={() => {}}
                story={story}
                getResponseLocations={getResponseLocations}
                mode='test_case'
            />
        </div>
    );

    const renderMerged = arrayOfEvents => arrayOfEvents.map((event, i) => {
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
