import React, { useState } from 'react';
import { storiesOf } from '@storybook/react';
import SplitPane from 'react-split-pane';
import StoryGroupTree from '../imports/ui/components/stories/StoryGroupTree';

const storyGroups = [
    {
        _id: '0',
        children: ['0-0'],
        isExpanded: false,
        name: 'Group 0 (pinned)',
        pinned: true,
    },
    {
        _id: '1',
        children: [],
        isExpanded: false,
        name: 'Group 1',
    },
    {
        _id: '2',
        children: [
            '2-0', '2-1', '2-2', '2-3',
        ],
        isExpanded: true,
        name: 'Group 2',
    },
    {
        _id: '3',
        children: [],
        isExpanded: false,
        name: 'Group 3',
    },
    {
        _id: '4',
        children: [],
        isExpanded: false,
        name: 'Group 4',
    },
    {
        _id: '5',
        children: [],
        isExpanded: false,
        name: 'Group 5',
    },
    {
        _id: '6',
        children: [
            '6-0', '6-1', '6-2', '6-3', '6-4',
        ],
        isExpanded: true,
        name: 'Group 6',
    },
];

const stories = [
    {
        _id: '0-0',
        title: 'Group 0-s0',
        storyGroupId: '0',
    },
    {
        _id: '2-0',
        title: 'Group 2-s0',
        storyGroupId: '2',
    },
    {
        _id: '2-1',
        title: 'Group 2-s1',
        storyGroupId: '2',
    },
    {
        _id: '2-2',
        title: 'Group 2-s2',
        storyGroupId: '2',
    },
    {
        _id: '2-3',
        title: 'Group 2-s3',
        storyGroupId: '2',
    },
    {
        _id: '6-0',
        title: 'Group 6-s0',
        storyGroupId: '6',
    },
    {
        _id: '6-1',
        title: 'Group 6-s1',
        storyGroupId: '6',
    },
    {
        _id: '6-2',
        title: 'Group 6-s2',
        storyGroupId: '6',
    },
    {
        _id: '6-3',
        title: 'Group 6-s3',
        storyGroupId: '6',
    },
    {
        _id: '6-4',
        title: 'Group 6-s4',
        storyGroupId: '6',
    },
];

const forms = [];

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
            className={resizing ? '' : 'width-transition'}
            onDragStarted={() => setResizing(true)}
            onDragFinished={() => setResizing(false)}
            pane1Style={{ overflow: 'hidden' }}
        >
            <div className='storygroup-browser'>
                <StoryGroupTree
                    forms={forms}
                    stories={stories}
                    storyGroups={storyGroups}
                    onChangeActiveStories={setActiveStories}
                    activeStories={activeStories}
                    onChangeStoryMenuSelection={setActiveStories}
                    storyMenuSelection={activeStories}
                />
            </div>
            <div>
                {activeStories.map(s => <h1>{s}</h1>)}
            </div>
        </SplitPane>
    );
}

storiesOf('StoryGroupTree', module)
    .add('default', () => (
        <StoryGroupTreeWrapped />
    ));
