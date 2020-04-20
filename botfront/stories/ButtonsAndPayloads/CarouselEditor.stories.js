import React, { useState } from 'react';
import { withKnobs, number } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import { withBackground } from '../../.storybook/decorators';

import CarouselEditor from '../../imports/ui/components/stories/common/CarouselEditor';

const initialValue = {
    elements: [
        {
            title: 'Strawberry',
            subtitle: 'Classic. Also not a _berry_ berry.',
            image_url: 'https://image.shutterstock.com/image-vector/strawberry-isolated-on-white-background-260nw-1217763694.jpg',
        },
        {
            title: 'Mulberry',
            subtitle: 'Leaves eaten by silk worms.',
            image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcRxfonrZq1gxu7V9JJ7XlETWvpn5EHF-eNF-k-nAiT5AqMOcHtj&usqp=CAU',
        },
        {
            title: 'Bilberry',
            subtitle: 'Only fruit found in Iceland.',
            image_url: 'https://thumbs.dreamstime.com/b/blueberry-branches-bush-vector-33127150.jpg',
        },
        {
            title: 'Chokeberry',
            image_url: 'https://cdn.imgbin.com/25/17/10/imgbin-chokeberry-blueberry-rEzsJXhWazQu6v6VyvRBcbqqv.jpg',
            buttons: [
                {
                    title: '$$$ Buy it',
                    type: 'postback',
                    payload: '/buy_chokeberries',
                },
                {
                    title: 'Sell it $$$',
                    type: 'postback',
                    payload: '/sell_chokeberries',
                },
            ],
        },
        {
            title: 'Cloudberry',
            image_url: 'https://p1.hiclipart.com/preview/207/998/426/pomegranate-flower-cloudberry-nectar-berries-juice-cranberry-syrup-food-png-clipart.jpg',
        },
    ],
};


const CarouselEditorWrapped = (props) => {
    const { value } = props;
    const [carousel, setCarousel] = useState(value || {});
    return (
        <CarouselEditor
            {...props}
            value={carousel}
            max={number('Max n cards', 7)}
            min={number('Min n cards', 1)}
            onChange={(...args) => { setCarousel(...args); action('onChange')(...args); }}
        />
    );
};

export default {
    title: 'ButtonsAndPayloads/CarouselEditor',
    component: CarouselEditor,
    decorators: [withKnobs, withBackground],
};

export const Blank = () => <CarouselEditorWrapped />;
export const Berries = () => <CarouselEditorWrapped value={initialValue} />;
