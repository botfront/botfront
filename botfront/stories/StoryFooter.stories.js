import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, boolean } from '@storybook/addon-knobs';
import { Segment } from 'semantic-ui-react';

import StoryFooter from '../imports/ui/components/stories/StoryFooter';

import '../imports/ui/components/stories/style.import.less';

const myPath = (`thisIsAReallyLongNameBranchForLogic
__thisIsAReallyLongNameBranchForLogic
__thisIsAReallyLongNameBranchForLogic
__test__nice__thisIsAReallyLongNameBranchForLogic
__test__nice__t
__test__nice__thisIsAReallyLogic
__test__nice__thisIsAReallyas
__test__nice__thisasdfasdf
__qasdfasdfasdfasdfasdfasdf
__ggfasdfasdfasdfasdf
__tdhrasdfasdasdfasdfasdf
__thifasdf`
);

const onBranchPH = () => {
    // eslint-disable-next-line no-console
    console.log('branched');
};

const onContinuePH = () => {
    // eslint-disable-next-line no-console
    console.log('linked');
};

storiesOf('StoryFooter', module)
    .addDecorator(withKnobs)
    .add('branch-only', () => (
        <div className='story-footer-parent'>
            <Segment.Group>
                <Segment attached='top'>Top Segment</Segment>
                <Segment>Middle Segment</Segment>
                <StoryFooter
                    onBranch={onBranchPH}
                    onContinue={onContinuePH}
                    canContinue={boolean('can continue', true)}
                    canBranch={boolean('can branch', true)}
                    storyPath={myPath}
                />
            </Segment.Group>
        </div>
    ))
    .add('branch&continue', () => (
        <div className='story-footer-parent'>
            <Segment.Group>
                <Segment attached='top'>Top Segment</Segment>
                <Segment>Middle Segment</Segment>
                <StoryFooter
                    onBranch={onBranchPH}
                    onContinue={onContinuePH}
                    canContinue={boolean('can continue', true)}
                    canBranch={boolean('can branch', true)}
                    storyPath={myPath}
                    disableContinue={false}
                />
            </Segment.Group>
        </div>
    ));
