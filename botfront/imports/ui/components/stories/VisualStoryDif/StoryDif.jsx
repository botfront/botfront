import React, { useMemo, useContext } from 'react';
import PropTypes from 'prop-types';
import StoryVisualEditor from '../common/StoryVisualEditor';
import StoryErrorBoundary from '../StoryErrorBoundary';
import { ConversationOptionsContext } from '../Context';

import { compareStorySteps } from '../../../../lib/test_case.utils';

const StoryDif = (props) => {
    const { actual, expected } = props;
    const { getResponseLocations } = useContext(
        ConversationOptionsContext,
    );


    const mergedBlocks = useMemo(() => compareStorySteps(actual, expected), [actual, expected]);

    const getVisualEditorClass = (type) => {
        if (type === 'expected') return 'expected';
        if (type === 'actual') return 'actual';
        return '';
    };
    const renderBlock = (steps, type) => (
        <div className='type story-comparison'>
            <StoryVisualEditor
                onSave={() => {}}
                story={steps}
                getResponseLocations={getResponseLocations}
                mode='test_case'
                className={getVisualEditorClass(type)}
            />
        </div>
    );

    const renderMerged = (events) => {
        if (events.type === 'match') {
            return (
                renderBlock(events.steps, 'match')
            );
        }
        if (events.type === 'dif') {
            return (
                <>
                    {events.expected.length > 0 ? renderBlock(events.expected, 'expected') : <div>EMPTY</div>}
                    {events.actual.length > 0 ? renderBlock(events.actual, 'actual') : <div>EMPTY</div>}
                </>
            );
        }
        return <div>NO TYPE</div>;
    };

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
