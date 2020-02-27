import React, { useState } from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs } from '@storybook/addon-knobs';
import StoryGroupTree from '../imports/ui/components/stories/StoryGroupTree';

const mockTree = {
    rootId: '1',
    items: {
        1: {
            id: '1',
            children: [
                '1-0', '1-1', '1-2', '1-3', '1-4', '1-5', '1-6',
            ],
            hasChildren: true,
            isExpanded: true,
            isChildrenLoading: false,
            data: {
                canBearChildren: true,
                title: 'root',
            },
        },
        '1-0': {
            id: '1-0',
            children: ['1-0-0'],
            hasChildren: true,
            isExpanded: false,
            isChildrenLoading: false,
            data: {
                canBearChildren: true,
                title: 'Group 0',
            },
        },
        '1-0-0': {
            id: '1-0-0',
            children: [],
            hasChildren: false,
            isExpanded: false,
            isChildrenLoading: false,
            data: {
                title: 'Group 0-s0',
            },
        },
        '1-1': {
            id: '1-1',
            children: [],
            hasChildren: false,
            isExpanded: false,
            isChildrenLoading: false,
            data: {
                canBearChildren: true,
                title: 'Group 1',
            },
        },
        '1-2': {
            id: '1-2',
            children: [
                '1-2-0', '1-2-1', '1-2-2', '1-2-3',
            ],
            hasChildren: true,
            isExpanded: true,
            isChildrenLoading: false,
            data: {
                canBearChildren: true,
                title: 'Group 2',
            },
        },
        '1-2-0': {
            id: '1-2-0',
            children: [],
            hasChildren: false,
            isExpanded: false,
            isChildrenLoading: false,
            data: {
                title: 'Group 2-s0',
            },
        },
        '1-2-1': {
            id: '1-2-1',
            children: [],
            hasChildren: false,
            isExpanded: false,
            isChildrenLoading: false,
            data: {
                title: 'Group 2-s1',
            },
        },
        '1-2-2': {
            id: '1-2-2',
            children: [],
            hasChildren: false,
            isExpanded: false,
            isChildrenLoading: false,
            data: {
                title: 'Group 2-s2',
            },
        },
        '1-2-3': {
            id: '1-2-3',
            children: [],
            hasChildren: false,
            isExpanded: false,
            isChildrenLoading: false,
            data: {
                title: 'Group 2-s3',
            },
        },
        '1-3': {
            id: '1-3',
            children: [],
            hasChildren: false,
            isExpanded: false,
            isChildrenLoading: false,
            data: {
                canBearChildren: true,
                title: 'Group 3',
            },
        },
        '1-4': {
            id: '1-4',
            children: [],
            hasChildren: false,
            isExpanded: false,
            isChildrenLoading: false,
            data: {
                canBearChildren: true,
                title: 'Group 4',
            },
        },
        '1-5': {
            id: '1-5',
            children: [],
            hasChildren: false,
            isExpanded: false,
            isChildrenLoading: false,
            data: {
                canBearChildren: true,
                title: 'Group 5',
            },
        },
        '1-6': {
            id: '1-6',
            children: [
                '1-6-0', '1-6-1', '1-6-2', '1-6-3', '1-6-4',
            ],
            hasChildren: true,
            isExpanded: true,
            isChildrenLoading: false,
            data: {
                canBearChildren: true,
                title: 'Group 6',
            },
        },
        '1-6-0': {
            id: '1-6-0',
            children: [],
            hasChildren: false,
            isExpanded: false,
            isChildrenLoading: false,
            data: {
                title: 'Group 6-s0',
            },
        },
        '1-6-1': {
            id: '1-6-1',
            children: [],
            hasChildren: false,
            isExpanded: false,
            isChildrenLoading: false,
            data: {
                title: 'Group 6-s1',
            },
        },
        '1-6-2': {
            id: '1-6-2',
            hasChildren: false,
            isExpanded: false,
            isChildrenLoading: false,
            data: {
                title: 'Group 6-s2',
            },
        },
        '1-6-3': {
            id: '1-6-3',
            children: [],
            hasChildren: false,
            isExpanded: false,
            isChildrenLoading: false,
            data: {
                title: 'Group 6-s3',
            },
        },
        '1-6-4': {
            id: '1-6-4',
            children: [],
            hasChildren: false,
            isExpanded: false,
            isChildrenLoading: false,
            data: {
                title: 'Group 6-s4',
            },
        },
    },
};

function StoryGroupTreeWrapped() {
    const [activeStory, setActiveStory] = useState({ data: {} });
    return (
        <div className='side-by-side'>
            <div>
                <StoryGroupTree
                    tree={mockTree}
                    onChangeActiveStory={setActiveStory}
                    activeStory={activeStory}
                />
            </div>
            <div>
                <h1>
                    {activeStory.data.title}
                </h1>
            </div>
        </div>
    );
}

storiesOf('StoryGroupTree', module)
    .addDecorator(withKnobs)
    .add('default', () => (
        <StoryGroupTreeWrapped />
    ));
