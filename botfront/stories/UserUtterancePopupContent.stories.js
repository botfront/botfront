import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs } from '@storybook/addon-knobs';
import { ProjectContext } from '../imports/ui/layouts/context';
import UserUtterancePopupContent from '../imports/ui/components/stories/common/UserUtterancePopupContent';
import DashedButton from '../imports/ui/components/stories/common/DashedButton';
import { intents, entities } from './AddStoryLine.stories';

const alertPayload = pl => alert(`
    Intent: ${pl.intent}
    ${pl.entities.length ? `Entities: ${pl.entities.map(e => `
        ${e.entity} ${e.entityValue ? `(${e.entityValue})` : ''}`)}
    ` : ''}
    `);

const trigger = <DashedButton color='blue'>User says:</DashedButton>;

storiesOf('UserUtterancePopupContent', module)
    .addDecorator(withKnobs)
    .addDecorator(story => (
        <div className='story-visual-editor'>
            <ProjectContext.Provider value={{ intents, entities }}>
                {story()}
            </ProjectContext.Provider>
        </div>
    ))
    .add('default', () => (
        <UserUtterancePopupContent
            onCreateFromInput={() => alert('from input!!')}
            onCreateFromPayload={u => alertPayload(u)}
            trigger={trigger}
        />
    ));
