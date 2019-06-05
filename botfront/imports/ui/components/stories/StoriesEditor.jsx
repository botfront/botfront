import {
    Icon, Container, Label, Popup, Segment,
} from 'semantic-ui-react';
import PropTypes from 'prop-types';
import AceEditor from 'react-ace';
import 'brace/mode/markdown';
import 'brace/theme/xcode';
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

    const { stories, disabled } = props;
    const editors = stories.map((story, index) => (
        <React.Fragment key={index}>
            <Segment>
                <AceEditor
                    readOnly={disabled}
                    width='100%'
                    mode='markdown'
                    name='story'
                    theme='xcode'
                    minLines={5}
                    maxLines={Infinity}
                    fontSize={12}
                    onChange={data => handleStoryChange(data, index)}
                    value={story}
                    showPrintMargin={false}
                    showGutter={false}
                    setOptions={{
                        showLineNumbers: false,
                        tabSize: 2,
                    }}
                />
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
};

StoriesEditor.defaultProps = {
    onChange: () => {},
    disabled: false,
};

export default StoriesEditor;
