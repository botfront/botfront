import {
    Grid,
    Message,
    Menu,
    Icon,
} from 'semantic-ui-react';
import PropTypes from 'prop-types';
import React from 'react';

import { wrapMeteorCallback } from '../utils/Errors';
import ItemsBrowser from '../common/Browser';
import StoriesEditor from './StoriesEditor';
import './style.less';

class Stories extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // storyIndex is used to track the index of element in the browser component
            // storyGroupNameSelected used to track the storygroup to be displayed by the storyEditor
            storyIndex: -1,
            saving: false,
            validationErrors: false,
            storyGroupNameSelected: '',
        };
    }

    handleAddStoryGroup = async (name) => {
        const { projectId } = this.props;
        Meteor.call(
            'storyGroups.insert',
            {
                name,
                projectId,
            },
            wrapMeteorCallback((err, groupId) => {
                if (!err) {
                    Meteor.call('stories.insert', {
                        story: `## ${name}`,
                        storyGroupId: groupId,
                        projectId,
                    },
                    wrapMeteorCallback((error) => {
                        if (!error) {
                            this.setState({
                                validationErrors: false,
                                storyGroupNameSelected: name,
                            });
                        }
                    }));
                }
            }),
        );
    };

    handleMenuChange = (index) => {
        this.setState({
            storyIndex: index,
            validationErrors: false,
            storyGroupNameSelected: '',
        });
    };

    handleSavingStories = () => {
        this.setState({ saving: true });
    };

    handleSavedStories = () => {
        this.setState({ saving: false });
    };

    handleError = () => {
        this.setState({ validationErrors: true });
    };

    handleErrorResolved = () => {
        this.setState({ validationErrors: false });
    };

    handleNewStory = (introStoryGroup) => {
        const { projectId, storyGroups } = this.props;
        const { storyIndex } = this.state;
        Meteor.call(
            'stories.insert',
            {
                story: `## ${!!introStoryGroup ? introStoryGroup.name : storyGroups[storyIndex].name}`,
                projectId,
                storyGroupId: `${!!introStoryGroup ? introStoryGroup._id : storyGroups[storyIndex]._id}`,
            },
            wrapMeteorCallback(),
        );
    };

    handleDeleteGroup = (index, filterdStoryGroup) => {
        if (index !== -1) {
            Meteor.call(
                'storyGroups.delete',
                filterdStoryGroup[index],
                wrapMeteorCallback((err) => {
                    if (!err) this.setState({ storyIndex: -1, storyGroupNameSelected: '' });
                }),
            );
        }
    };

    handleStoryGroupSelect = (storyGroup) => {
        // eslint-disable-next-line no-param-reassign
        storyGroup.selected = !storyGroup.selected;
        Meteor.call(
            'storyGroups.update',
            storyGroup,
            wrapMeteorCallback(),
        );
    }

    handleNameChange = (storyGroup) => {
        Meteor.call(
            'storyGroups.update',
            storyGroup,
            wrapMeteorCallback((err) => {
                if (!err) {
                    this.setState({ storyGroupNameSelected: storyGroup.name });
                }
            }),
        );
    }

    handleIntroStoryClick = (event) => {
        event.preventDefault();
        this.setState({ storyIndex: -1, storyGroupNameSelected: '' });
    }

    sortAlphabetically = (a, b) => (a.name.localeCompare(b.name));

    handleIntroClick = (e, introStory) => {
        e.stopPropagation();
        this.handleStoryGroupSelect(introStory);
    }

    storyGroupSelected = (storyIndex, storyGroupNameSelected, storyGroupFiltered) => {
        if (storyGroupNameSelected === '' || (storyGroupFiltered[storyIndex] && storyGroupFiltered[storyIndex].name) === storyGroupNameSelected) {
            return storyIndex;
        }
        return storyGroupFiltered.findIndex(storyGroup => (storyGroup.name === storyGroupNameSelected));
    }

    renderStoryEditor = (storyGroupFiltered, introStory, storySelected) => {
        const { projectId } = this.props;
        const storyGroupSelected = storyGroupFiltered[storySelected];
        return (storyGroupSelected || introStory) && (
            <StoriesEditor
                storyGroup={storyGroupSelected || introStory}
                onSaving={this.handleSavingStories}
                onSaved={this.handleSavedStories}
                onError={this.handleError}
                onErrorResolved={this.handleErrorResolved}
                onAddNewStory={() => this.handleNewStory(storyGroupSelected || introStory)}
                projectId={projectId}
                onDeleteGroup={() => this.handleDeleteGroup(storySelected, storyGroupFiltered)}
            />
        );
    }
    
    render() {
        const { storyGroups } = this.props;
        const { storyIndex, saving, validationErrors, storyGroupNameSelected } = this.state;
        const introStory = storyGroups.find(storyGroup => (storyGroup.introStory));
        const storyGroupFiltered = storyGroups.filter((storyGroup => !storyGroup.introStory)).sort(this.sortAlphabetically);
        const storySelected = this.storyGroupSelected(storyIndex, storyGroupNameSelected, storyGroupFiltered);

        return (
            <Grid className='stories-container'>

                <Grid.Row columns={2}>
                    <Grid.Column width={4}>
                        <Menu vertical fluid onClick={this.handleIntroStoryClick} className={`intro-story ${storySelected === -1 ? 'selected-intro-story' : ''}`}>
                            <Menu.Item
                                key='intro-story'
                                active={storySelected === -1}
                                link
                            >
                                <Icon
                                    id={`${introStory.selected ? 'selected' : 'not-selected'}`}
                                    name='grid layout'
                                    onClick={e => this.handleIntroClick(e, introStory)}
                                />
                                <span>Intro Stories</span>
                            </Menu.Item>
                        </Menu>
                    </Grid.Column>
                    <Grid.Column width={12} className='story-name-parent'>
                        {storySelected !== -1 ? (
                            <Message info size='small'>Story Groups</Message>
                        ) : (
                            <Message info size='small'>The intro stories group contains the initial messages that would be sent to users when they start chatting with your bot</Message>
                        )}
                    </Grid.Column>
                </Grid.Row>

                <Grid.Row columns={2}>
                    <Grid.Column width={4}>
                        {validationErrors && (
                            <Message
                                warning
                                content="Your changes haven't been saved. Correct errors first."
                            />
                        )}
                        {storyGroupFiltered && (
                            <ItemsBrowser
                                data={storyGroupFiltered}
                                allowAddition
                                allowEdit
                                index={storySelected}
                                onAdd={this.handleAddStoryGroup}
                                onChange={this.handleMenuChange}
                                nameAccessor='name'
                                saving={saving}
                                selectAccessor='selected'
                                toggleSelect={this.handleStoryGroupSelect}
                                changeName={this.handleNameChange}
                            />)
                        }
                    </Grid.Column>

                    <Grid.Column width={12}>
                        {this.renderStoryEditor(storyGroupFiltered, introStory, storySelected)}
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        );
    }
}

Stories.propTypes = {
    projectId: PropTypes.string.isRequired,
    storyGroups: PropTypes.array.isRequired,
};

export default Stories;
