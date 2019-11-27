import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, boolean } from '@storybook/addon-knobs';
import { ProjectContext } from '../imports/ui/layouts/context';
import BotResponsePopupContent from '../imports/ui/components/stories/common/BotResponsePopupContent';
import DashedButton from '../imports/ui/components/stories/common/DashedButton';

const responses = [
    { name: 'YO' },
    { name: 'blah' },
    { name: 'doodoo' },
];

const trigger = <DashedButton color='green'>Bot Response</DashedButton>;

storiesOf('BotResponsePopupContent', module)
    .addDecorator(withKnobs)
    .addDecorator(story => (
        <div className='story-visual-editor'>
            <ProjectContext.Provider value={{ responses }}>
                {story()}
            </ProjectContext.Provider>
        </div>
    ))
    .add('default', () => (
        <BotResponsePopupContent
            onSelect={r => alert(`${r.name}!!`)}
            onCreate={r => alert(`${r}!!`)}
            trigger={trigger}
            noButtonResponse={boolean('Disable button responses', false)}
            limitedSelection={boolean('Limited selection', false)}
        />
    ));
