import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs } from '@storybook/addon-knobs';
import Context from '../imports/ui/components/stories/common/Context';
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
        <Context.Provider value={{ responses }}>
            {story()}
        </Context.Provider>
    ))
    .add('default', () => (
        <BotResponsePopupContent
            onSelect={r => alert(`${r.name}!!`)}
            onCreate={r => alert(`${r}!!`)}
            trigger={trigger}
        />
    ));
