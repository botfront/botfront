import {
    Icon, Container, Popup, Segment, Message,
} from 'semantic-ui-react';
import PropTypes from 'prop-types';
import AceEditor from 'react-ace';
import 'brace/theme/github';
import React from 'react';

function StoriesEditor(props) {
    function addStory() {
        props.onChange([...props.stories, '']);
    }

    function handleStoryChange(newStory, index) {
        const newStories = [...props.stories];
        newStories[index] = newStory;
        props.onChange(newStories);
    }

    function handeStoryDeletion(index) {
        const newStories = [...props.stories];
        newStories.splice(index, 1);
        props.onChange(newStories);
    }

    const { stories, disabled, errors } = props;
    const editors = stories.map((story, index) => (
        <React.Fragment key={index}>
            <Segment>
                <AceEditor
                    readOnly={disabled}
                    theme='github'
                    width='95%'
                    name='story'
                    minLines={5}
                    maxLines={Infinity}
                    fontSize={12}
                    onChange={data => handleStoryChange(data, index)}
                    value={story}
                    showPrintMargin={false}
                    showGutter
                    annotations={
                        !!errors[index]
                        && !!errors[index].length
                        && errors[index].map(error => ({
                            row: error.line - 1,
                            type: error.type,
                            text: error.message,
                            column: 0,
                        }))
                    }
                    setOptions={{
                        tabSize: 2,
                    }}
                />
                <Icon
                    name='trash'
                    color='grey'
                    link
                    onClick={() => handeStoryDeletion(index)}
                />
            </Segment>
            {index !== stories.length - 1 && <br />}
        </React.Fragment>
    ));

    return (
        <>
            {!errors.every(error => !error.length) && (
                <Message
                    warning
                    content="Your changes haven't been saved. Correct errors first."
                />
            )}
            {editors}
            <Container textAlign='center'>
                <Popup
                    trigger={
                        <Icon name='add' link onClick={addStory} size='large' />
                    }
                    content='Add a story'
                />
            </Container>
        </>
    );
}

StoriesEditor.propTypes = {
    stories: PropTypes.array.isRequired,
    onChange: PropTypes.func,
    disabled: PropTypes.bool,
    errors: PropTypes.array,
};

StoriesEditor.defaultProps = {
    onChange: () => {},
    disabled: false,
    errors: [],
};

export default StoriesEditor;
