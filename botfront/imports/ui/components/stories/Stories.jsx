import {
    Grid, Message, Menu, Icon,
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
                    Meteor.call(
                        'stories.insert',
                        {
                            story: '* replace_with_intent',
                            title: name,
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
                        }),
                    );
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

    handleNewStory = (introStoryGroup, indexOfNewStory) => {
        const { projectId, storyGroups } = this.props;
        const { storyIndex } = this.state;
        Meteor.call(
            'stories.insert',
            {
                story: '* replace_with_intent',
                title: `${
                    !!introStoryGroup
                        ? introStoryGroup.name
                        : storyGroups[storyIndex].name
                } ${indexOfNewStory}`,
                projectId,
                storyGroupId: `${
                    !!introStoryGroup
                        ? introStoryGroup._id
                        : storyGroups[storyIndex]._id
                }`,
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
                    if (!err) {
                        this.setState({
                            storyIndex: -1,
                            storyGroupNameSelected: '',
                        });
                    }
                }),
            );
        }
    };

    handleStoryGroupSelect = (storyGroup) => {
        // eslint-disable-next-line no-param-reassign
        storyGroup.selected = !storyGroup.selected;
        Meteor.call('storyGroups.update', storyGroup, wrapMeteorCallback());
    };

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
    };

    handleIntroStoryClick = (event) => {
        event.preventDefault();
        this.setState({ storyIndex: -1, storyGroupNameSelected: '' });
    };

    sortAlphabetically = (a, b) => a.name.localeCompare(b.name);

    handleIntroClick = (e, introStory) => {
        e.stopPropagation();
        this.handleStoryGroupSelect(introStory);
    };

    storyGroupSelected = (
        storyIndex,
        storyGroupNameSelected,
        storyGroupFiltered,
    ) => {
        if (
            storyGroupNameSelected === ''
            || (storyGroupFiltered[storyIndex]
                && storyGroupFiltered[storyIndex].name) === storyGroupNameSelected
        ) {
            return storyIndex;
        }
        return storyGroupFiltered.findIndex(
            storyGroup => storyGroup.name === storyGroupNameSelected,
        );
    };

    renderStoryEditor = (storyGroupFiltered, introStory, storySelected) => {
        const { projectId, storyGroups } = this.props;
        const storyGroupSelected = storyGroupFiltered[storySelected];
        return (
            (storyGroupSelected || introStory) && (
                <StoriesEditor
                    storyGroup={storyGroupSelected || introStory}
                    onSaving={this.handleSavingStories}
                    onSaved={this.handleSavedStories}
                    onError={this.handleError}
                    onErrorResolved={this.handleErrorResolved}
                    onAddNewStory={index => this.handleNewStory(
                        storyGroupSelected || introStory,
                        index,
                    )
                    }
                    projectId={projectId}
                    onDeleteGroup={() => this.handleDeleteGroup(
                        storySelected,
                        storyGroupFiltered,
                    )
                    }
                    groupNames={storyGroups.map(group => ({
                        text: group.name,
                        value: group._id,
                    }))}
                />
            )
        );
    };

    removeAllSelection = () => {
        const { projectId } = this.props;
        Meteor.call('storyGroups.removeFocus', projectId);
    };

    renderMessages = () => {
        const { storyGroups } = this.props;
        const numberOfSelectedStoryGroups = storyGroups.filter(
            storyGroup => storyGroup.selected,
        ).length;
        /* eslint-disable jsx-a11y/click-events-have-key-events */
        const link = (
            <span
                id='remove-focus'
                tabIndex='0'
                onClick={this.removeAllSelection}
                role='button'
            >
                Remove focus
            </span>
        );
        const plural = numberOfSelectedStoryGroups > 1;
        return (
            numberOfSelectedStoryGroups >= 1 && (
                <Message warning>
                    You’re currently focusing on {numberOfSelectedStoryGroups}{' '}
                    story group{plural && 's'} and only{' '}
                    {plural ? 'those' : 'that'} story group{plural && 's'} will
                    be trained. {link}
                </Message>
            )
        );
    };

    render() {
        const { storyGroups } = this.props;
        const {
            storyIndex,
            saving,
            validationErrors,
            storyGroupNameSelected,
        } = this.state;
        const introStory = storyGroups.find(
            storyGroup => storyGroup.introStory,
        );
        const storyGroupFiltered = storyGroups
            .filter(storyGroup => !storyGroup.introStory)
            .sort(this.sortAlphabetically);
        const storySelected = this.storyGroupSelected(
            storyIndex,
            storyGroupNameSelected,
            storyGroupFiltered,
        );

        return (
            <Grid className='stories-container'>
                <Grid.Row columns={2}>
                    <Grid.Column width={4}>
                        <Menu
                            vertical
                            fluid
                            onClick={this.handleIntroStoryClick}
                            className={`intro-story ${
                                storySelected === -1
                                    ? 'selected-intro-story'
                                    : ''
                            }`}
                        >
                            <Menu.Item
                                active={storySelected === -1}
                                link
                                data-cy='intro-story-group'
                            >
                                <Icon
                                    id={`${
                                        introStory && introStory.selected
                                            ? 'selected'
                                            : 'not-selected'
                                    }`}
                                    name='eye'
                                    onClick={e => this.handleIntroClick(e, introStory)
                                    }
                                />
                                <span>Intro Stories</span>
                            </Menu.Item>
                        </Menu>
                    </Grid.Column>
                    <Grid.Column width={12} className='story-name-parent'>
                        {storySelected !== -1 ? (
                            <Message info size='small'>
                                Story Groups
                            </Message>
                        ) : (
                            <Message info size='small'>
                                The intro stories group contains the initial
                                messages that would be sent to users when they
                                start chatting with your bot
                            </Message>
                        )}
                    </Grid.Column>
                </Grid.Row>

                <Grid.Row columns={2}>
                    <Grid.Column width={4}>
                        {validationErrors && (
                            <Message
                                negative
                                content="Your changes haven't been saved. Correct errors first."
                            />
                        )}
                        {this.renderMessages()}
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
                            />
                        )}
                    </Grid.Column>

                    <Grid.Column width={12}>
                        {this.renderStoryEditor(
                            storyGroupFiltered,
                            introStory,
                            storySelected,
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
