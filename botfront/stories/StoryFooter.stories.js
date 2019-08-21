import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, boolean } from '@storybook/addon-knobs';

import StoryFooter from '../imports/ui/components/stories/StoryFooter';

import '../imports/ui/components/stories/style.import.less';

const style = { height: '200px', backgroundColor: 'rgba(180,180,200)'}
const myPath = 'thisIsAReallyLongNameBranchForLogic__thisIsAReallyLongNameBranchForLogic__thisIsAReallyLongNameBranchForLogic__test__nice__thisIsAReallyLongNameBranchForLogic__test__nice__thisIsAReallyLongNameBranchForLogic__test__nice__thisIsAReallyLongNameBranchForLogic__test__nice__thisIsAReallyLongNameBranchForLogic__test__nice';

const onBranchPH = () => {
    // eslint-disable-next-line no-console
    console.log("branched");
};

const onContinuePH = () => {
    // eslint-disable-next-line no-console
    console.log('linked');
};

storiesOf('mystory', module)
    .addDecorator(withKnobs)
    .add('default-footer', () => {
        return (
            <div className='story-footer-parent'>
                <div style={style}>
                    hello
                </div>
                <StoryFooter
                    className='bread-crumb-container'
                    onBranch={onBranchPH}
                    onContinue={onContinuePH}
                    canContinue={boolean('can continue', true)}
                    canBranch={boolean('can branch', true)}
                    storyPath={myPath}
                />
            </div>
        );
    });
