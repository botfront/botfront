import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { storiesOf } from '@storybook/react';
import { withBackground, slots } from '../.storybook/decorators';
import { StoryController } from '../imports/lib/story_controller';
import StoryVisualEditor from '../imports/ui/components/stories/common/StoryVisualEditor';

const storyOne = `    - action_bebe
    - slot{"catSlot1": "c1"}
* I_come_from{"from": "Paris"}
    - utter_yay
    - utter_carou
* I_want_peanuts_on_my_sundae
    - utter_boo
* Im_summarizing_Moby_Dick`;

const StoryVisualEditorWrapped = ({ story: s }) => {
    const [story, setStory] = useState(
        new StoryController({
            story: s,
            slots,
            onUpdate: () => setStory(Object.assign(Object.create(story), story)),
        }),
    );

    return (
        <StoryVisualEditor story={story} />
    );
};

StoryVisualEditorWrapped.propTypes = {
    story: PropTypes.array,
};

StoryVisualEditorWrapped.defaultProps = {
    story: [],
};

storiesOf('StoryVisualEditor', module)
    .addDecorator(withBackground)
    .add('default', () => (
        <StoryVisualEditorWrapped story={storyOne} />
    ));
