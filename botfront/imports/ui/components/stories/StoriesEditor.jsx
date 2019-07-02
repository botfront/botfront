import {
    Icon, Container, Popup, Segment, Button,
} from 'semantic-ui-react';
import { withTracker } from 'meteor/react-meteor-data';
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import AceEditor from 'react-ace';
import 'brace/theme/github';
import 'brace/mode/text';

import { Stories } from '../../../api/story/stories.collection';
import { StoryValidator } from '../../../lib/story_validation';
import ConfirmPopup from '../common/ConfirmPopup';
import { wrapMeteorCallback } from '../utils/Errors';

function StoriesEditor(props) {
    const [deletePopup, setDeletePopup] = useState(-1);
    const [errors, setErrors] = useState([]);
    // This state is only used to store edited stories
    const [storyTexts, setStoryTexts] = useState([]);

    const {
        stories,
        disabled,
        onSaving,
        onSaved,
        onError,
        onErrorResolved,
        onAddNewStory,
        onDeleteGroup,
        storyGroup,
    } = props;

    // This effect listen to changes on errors and notifies
    // the parent component if no errors were detected
    useEffect(() => {
        let noErrors = true;
        errors.forEach((error) => {
            if (error && error.length) {
                noErrors = false;
            }
        });
        if (noErrors) onErrorResolved();
    }, [errors]);

    // This effect resets the state if the storyGroup being displayed changed
    useEffect(() => {
        setStoryTexts([]);
        setErrors([]);
        setDeletePopup(-1);
    }, [storyGroup]);

    function saveStory(story) {
        onSaving();
        Meteor.call(
            'stories.update',
            story,
            wrapMeteorCallback(() => {
                onSaved();
            }),
        );
    }

    function handleStoryChange(newStory, index) {
        const newTexts = [...storyTexts];
        newTexts[index] = newStory;
        setStoryTexts(newTexts);
        const validator = new StoryValidator(newStory);
        validator.validateStories();

        if (!newStory.replace(/\s/g, '').length) {
            validator.exceptions.push({
                type: 'error',
                line: 1,
                message: 'don\'t leave the story empty.',
            });
        }

        const newErrors = [...errors];
        newErrors[index] = validator.exceptions;
        setErrors(newErrors);

        if (validator.exceptions.length) {
            onError();
            // We save the story only if there are no errors
            return;
        }
        saveStory({ ...stories[index], story: newStory });
    }

    function handeStoryDeletion(index) {
        setDeletePopup(-1);
        const toBeDeletedStory = stories[index];
        Meteor.call('stories.delete', toBeDeletedStory, wrapMeteorCallback());
        const stateErrors = [...errors];
        stateErrors.splice(index, 1);
        setErrors(stateErrors);
        const stateStoryTexts = [...storyTexts];
        stateStoryTexts.splice(index, 1);
        setStoryTexts(stateStoryTexts);
        Meteor.call(
            'stories.delete',
            toBeDeletedStory,
            wrapMeteorCallback((err) => {
                if (!err) {
                    if (stories.length === 1) {
                        onDeleteGroup();
                    }
                }
            }),
        );
    }

    const editors = stories.map((story, index) => (
        <React.Fragment key={index}>
            <Segment data-cy='story-editor'>
                <AceEditor
                    readOnly={disabled}
                    theme='github'
                    width='95%'
                    name='story'
                    mode='text'
                    minLines={5}
                    maxLines={Infinity}
                    fontSize={12}
                    onChange={data => handleStoryChange(data, index)}
                    value={
                        storyTexts[index] !== undefined
                            ? storyTexts[index]
                            : story.story
                    }
                    showPrintMargin={false}
                    showGutter
                    // We use ternary expressions here to prevent wrong prop types
                    annotations={
                        (!!errors[index] ? true : undefined)
                        && (!!errors[index].length ? true : undefined)
                        && errors[index].map(error => ({
                            row: error.line - 1,
                            type: error.type,
                            text: error.message,
                            column: 0,
                        }))
                    }
                    editorProps={{
                        $blockScrolling: Infinity,
                    }}
                    setOptions={{
                        tabSize: 2,
                    }}
                />
                <Popup
                    trigger={(
                        <Icon
                            name='trash'
                            color='grey'
                            link
                            data-cy='delete-story'
                        />
                    )}
                    content={(
                        <ConfirmPopup
                            title='Delete story ?'
                            onYes={() => handeStoryDeletion(index)}
                            onNo={() => setDeletePopup(-1)}
                        />
                    )}
                    on='click'
                    open={deletePopup === index}
                    onOpen={() => setDeletePopup(index)}
                    onClose={() => setDeletePopup(-1)}
                />
            </Segment>
            {index !== stories.length - 1 && <br />}
        </React.Fragment>
    ));

    return (
        <>
            {editors}
            <Container textAlign='center'>
                <Button icon='add' basic name='add' onClick={onAddNewStory} size='large' data-cy='add-story' color='black' content='Add a story' />
            </Container>
        </>
    );
}

StoriesEditor.propTypes = {
    storyGroup: PropTypes.object.isRequired,
    stories: PropTypes.array,
    // this method will be called when the component starts saving changes
    onSaving: PropTypes.func.isRequired,
    // This one is called when changes are saved
    onError: PropTypes.func.isRequired,
    onErrorResolved: PropTypes.func.isRequired,
    onSaved: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    onAddNewStory: PropTypes.func.isRequired,
    projectId: PropTypes.string.isRequired,
    onDeleteGroup: PropTypes.func.isRequired,
};

StoriesEditor.defaultProps = {
    disabled: false,
    stories: [],
};

export default withTracker((props) => {
    const { storyGroup, projectId } = props;
    // We're using a specific subscription so we don't fetch too much at once
    const storiesHandler = Meteor.subscribe(
        'stories.inGroup',
        projectId,
        storyGroup._id,
    );

    return {
        ready: storiesHandler.ready(),
        stories: Stories.find({
            projectId,
            storyGroupId: storyGroup._id,
        }).fetch(),
    };
})(StoriesEditor);
