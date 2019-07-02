import {
    Grid,
    Message,
    Header,
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
                    this.setState({
                        validationErrors: false,
                        storyGroupNameSelected: name,
                    });
                    Meteor.call('stories.insert', {
                        story: `## ${name}`,
                        storyGroupId: groupId,
                        projectId,
                    });
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
        this.setState({ storyIndex: -1 });
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
    
    render() {
        const { storyGroups, projectId } = this.props;
        const { storyIndex, saving, validationErrors, storyGroupNameSelected } = this.state;
        const introStory = storyGroups.find(storyGroup => (storyGroup.introStory));
        const storyGroupFiltered = storyGroups.filter((storyGroup => !storyGroup.introStory)).sort(this.sortAlphabetically);
        const storySelected = this.storyGroupSelected(storyIndex, storyGroupNameSelected, storyGroupFiltered);

        return (
            <Grid className='stories-container'>

                <Grid.Row columns={2}>
                    <Grid.Column width={4}>
                        <Menu vertical fluid onClick={this.handleIntroStoryClick} className={`intro-story ${storyIndex === -1 ? 'selected-intro-story' : ''}`}>
                            <Menu.Item
                                key='intro-story'
                                active={storyIndex === -1}
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
                        {storyIndex !== -1 ? (
                            <Header className='story-name'>
                                {storyGroupFiltered[storySelected] && storyGroupFiltered[storySelected].name}
                            </Header>
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
                        {storyIndex > -2 && (storyGroupFiltered[storySelected] || introStory) ? (
                            <StoriesEditor
                                storyGroup={storyGroupFiltered[storySelected] ? storyGroupFiltered[storySelected] : introStory}
                                onSaving={this.handleSavingStories}
                                onSaved={this.handleSavedStories}
                                onError={this.handleError}
                                onErrorResolved={this.handleErrorResolved}
                                onAddNewStory={() => this.handleNewStory(storyIndex !== -1 ? storyGroupFiltered[storySelected] : introStory)}
                                projectId={projectId}
                                onDeleteGroup={() => this.handleDeleteGroup(storyIndex, storyGroupFiltered)}
                            />
                        ) : (
                            <Message content='select or create a story group' />
                        )}
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
