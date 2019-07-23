import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, boolean } from '@storybook/addon-knobs';
import { ConversationOptionsContext } from '../imports/ui/components/utils/Context';
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
        <ConversationOptionsContext.Provider value={{ responses }}>
            {story()}
        </ConversationOptionsContext.Provider>
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
