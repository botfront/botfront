import React, { useState } from 'react';
import { withKnobs } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import { withBackground } from '../../.storybook/decorators';

import CarouselSlide from '../../imports/ui/components/stories/common/CarouselSlide';

const value = {
    title: '',
    image_url: '',
    subtitle: '',
    default_action: undefined,
    buttons: [
        {
            title: 'option 1',
            type: 'web_url',
            url: 'http://yahoo.com/',
        },
    ],
};


const CarouselSlideWrapped = (props) => {
    const { value } = props;
    const [buttons, setButtons] = useState(value);
    return (
        <CarouselSlide
            {...props}
            value={buttons}
            onChange={(...args) => { setButtons(...args); action('onChange')(...args); }}
        />
    );
};

export default {
    title: 'ButtonsAndPayloads/CarouselSlide',
    component: CarouselSlide,
    decorators: [withKnobs, withBackground],
};

export const Basic = () => (
    <CarouselSlideWrapped value={value} />
);
