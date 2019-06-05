import {
    Icon,
    Container,
    Label,
    Popup,
    Segment,
    Message,
} from 'semantic-ui-react';
import PropTypes from 'prop-types';
import AceEditor from 'react-ace';
import 'brace/mode/markdown';
import 'brace/theme/xcode';
import React from 'react';
import ReactMarkdown from 'react-markdown';

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
                    width='95%'
                    mode='markdown'
                    name='story'
                    theme='xcode'
                    minLines={5}
                    maxLines={Infinity}
                    fontSize={12}
                    onChange={data => handleStoryChange(data, index)}
                    value={story}
                    showPrintMargin={false}
                    showGutter
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
                {errors[index] && !!errors[index].length && (
                    <Message warning>
                        {errors[index].map((error, indexErrors) => (
                            <span key={indexErrors}>
                                <b>{error.type}:</b>
                                {` line ${error.line}`}
                                <ReactMarkdown source={error.message} />
                            </span>
                        ))}
                    </Message>
                )}
            </Segment>
            {index !== stories.length - 1 && (
                <Container textAlign='center'>
                    <Label content='AND' color='teal' basic />
                </Container>
            )}
        </React.Fragment>
    ));

    return (
        <>
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
