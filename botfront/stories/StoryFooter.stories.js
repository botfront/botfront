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
__test__nice__thisIsAReallyLongNameBranchForLogic
__test__nice__thisIsAReallyLongNameBranchForLogic
__test__nice__thisIsAReallyLongNameBranchForLogic
__test__nice`
);

const onBranchPH = () => {
    // eslint-disable-next-line no-console
    console.log('branched');
};

const onContinuePH = () => {
    // eslint-disable-next-line no-console
    console.log('linked');
};

storiesOf('mystory', module)
    .addDecorator(withKnobs)
    .add('default-footer', () => (
        <div className='story-footer-parent'>
            <Segment.Group>
                <Segment attached='top'>Top Segment</Segment>
                <Segment>Middle Segment</Segment>
                <StoryFooter
                    className='bread-crumb-container'
                    onBranch={onBranchPH}
                    onContinue={onContinuePH}
                    canContinue={boolean('can continue', true)}
                    canBranch={boolean('can branch', true)}
                    storyPath={myPath}
                />
            </Segment.Group>
        </div>
    ));
