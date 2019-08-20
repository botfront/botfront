import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, boolean } from '@storybook/addon-knobs';

import StoryFooter from '../imports/ui/components/stories/StoryFooter';

const style = { height: '200px', backgroundColor: 'rgba(180,180,200)'}

const onBranchPH = (data) => {
    // eslint-disable-next-line no-console
    console.log(data);
};

const onContinuePH = (data) => {
    // eslint-disable-next-line no-console
    console.log(data);
};

storiesOf('mystory', module)
    .addDecorator(withKnobs)
    .add('default-footer', () => {
        return (
            <>
                <div style={style}>
                    <StoryFooter
                        onBranch={onBranchPH}
                        onContinue={onContinuePH}
                        canContinue={boolean('can continue', true)}
                        canBranch={boolean('can branch', true)}
                        storyPath='thisIsAReallyLongNameBranchForLogic__thisIsAReallyLongNameBranchForLogic__thisIsAReallyLongNameBranchForLogic__test__nice'
                    />
                </div>
            </>
        );
    });
