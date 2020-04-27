import React, { useState } from 'react';
import { withKnobs } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import { withBackground } from '../../.storybook/decorators';

import CarouselSlide from '../../imports/ui/components/stories/common/CarouselSlide';

const initialValue = {
    title: 'Sample card',
    image_url: 'https://www.google.com/logos/doodles/2020/thank-you-teachers-and-childcare-workers-6753651837108762.3-law.gif',
    subtitle: 'Hey! Find what you\'re looking for on the internet!',
    default_action: {
        type: 'web_url',
        url: 'http://google.com/',
    },
    buttons: [
        {
            title: 'Yahoo',
            type: 'web_url',
            url: 'http://yahoo.com/',
        },
        {
            title: 'GoDuckGo',
            type: 'web_url',
            url: 'http://goduckgo.com/',
        },
    ],
};


const CarouselSlideWrapped = (props) => {
    const { value } = props;
    const [slide, setSlide] = useState(value || {});
    return (
        <CarouselSlide
            {...props}
            value={slide}
            onChange={(...args) => { setSlide(...args); action('onChange')(...args); }}
        />
    );
};

export default {
    title: 'ButtonsAndPayloads/CarouselSlide',
    component: CarouselSlide,
    decorators: [withKnobs, withBackground],
};

export const Blank = () => <CarouselSlideWrapped />;
export const SampleCard = () => <CarouselSlideWrapped value={initialValue} />;
