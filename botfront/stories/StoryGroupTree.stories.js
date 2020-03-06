import React, { useState } from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs } from '@storybook/addon-knobs';
import SplitPane from 'react-split-pane';
import StoryGroupTree from '../imports/ui/components/stories/StoryGroupTree';

const storyGroups = [
    {
        _id: 'bf',
        children: [
            '0', '1', '2', '3', '4', '5', '6',
        ],
        hasChildren: true,
        isExpanded: true,
        canBearChildren: true,
        title: 'root',
    },
    {
        _id: '0',
        children: ['0-0'],
        hasChildren: true,
        isExpanded: false,
        canBearChildren: true,
        title: 'Group 0',
        parentId: 'bf',
    },
    {
        _id: '1',
        children: [],
        hasChildren: false,
        isExpanded: false,
        canBearChildren: true,
        title: 'Group 1',
        parentId: 'bf',
    },
    {
        _id: '2',
        children: [
            '2-0', '2-1', '2-2', '2-3',
        ],
        hasChildren: true,
        isExpanded: true,
        canBearChildren: true,
        title: 'Group 2',
        parentId: 'bf',
    },
    {
        _id: '3',
        children: [],
        hasChildren: false,
        isExpanded: false,
        canBearChildren: true,
        title: 'Group 3',
        parentId: 'bf',
    },
    {
        _id: '4',
        children: [],
        isExpanded: false,
        canBearChildren: true,
        title: 'Group 4',
        parentId: 'bf',
    },
    {
        _id: '5',
        children: [],
        hasChildren: false,
        isExpanded: false,
        canBearChildren: true,
        title: 'Group 5',
        parentId: 'bf',
    },
    {
        _id: '6',
        children: [
            '6-0', '6-1', '6-2', '6-3', '6-4',
        ],
        hasChildren: true,
        isExpanded: true,
        canBearChildren: true,
        title: 'Group 6',
        parentId: 'bf',
    },
];

const stories = [
    {
        _id: '0-0',
        title: 'Group 0-s0',
        parentId: '0',
    },
    {
        _id: '2-0',
        title: 'Group 2-s0',
        parentId: '2',
    },
    {
        _id: '2-1',
        title: 'Group 2-s1',
        parentId: '2',
    },
    {
        _id: '2-2',
        title: 'Group 2-s2',
        parentId: '2',
    },
    {
        _id: '2-3',
        title: 'Group 2-s3',
        parentId: '2',
    },
    {
        _id: '6-0',
        title: 'Group 6-s0',
        parentId: '6',
    },
    {
        _id: '6-1',
        title: 'Group 6-s1',
        parentId: '6',
    },
    {
        _id: '6-2',
        title: 'Group 6-s2',
        parentId: '6',
    },
    {
        _id: '6-3',
        title: 'Group 6-s3',
        parentId: '6',
    },
    {
        _id: '6-4',
        title: 'Group 6-s4',
        parentId: '6',
    },
];

function StoryGroupTreeWrapped() {
    const [activeStories, setActiveStories] = useState([]);
    const [resizing, setResizing] = useState(false);
    return (
        <SplitPane
            split='vertical'
            minSize={200}
            defaultSize={300}
            maxSize={400}
            primary='first'
            allowResize
            className={resizing ? '' : 'w_idth-transition'}
            onDragStarted={() => setResizing(true)}
            onDragFinished={() => setResizing(false)}
        >
            <StoryGroupTree
                stories={stories}
                storyGroups={storyGroups}
                onChangeActiveStories={setActiveStories}
                activeStories={activeStories}
            />
            <div>
                {activeStories.map(s => <h1>{s.title}</h1>)}
            </div>
        </SplitPane>
    );
}

storiesOf('StoryGroupTree', module)
    .addDecorator(withKnobs)
    .add('default', () => (
        <StoryGroupTreeWrapped />
    ));
