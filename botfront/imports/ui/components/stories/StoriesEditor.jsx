import {
    Icon, Container, Popup, Segment,
} from 'semantic-ui-react';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import AceEditor from 'react-ace';
import 'brace/theme/github';
import 'brace/mode/text';

import ConfirmPopup from '../common/ConfirmPopup';

function StoriesEditor(props) {
    const [deletePopup, setDeletePopup] = useState(-1);
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
        setDeletePopup(-1);
        props.onChange(newStories);
    }

    const { stories, disabled, errors } = props;
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
                    value={story}
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
                <Popup
                    trigger={(
                        <Icon
                            name='add'
                            link
                            onClick={addStory}
                            size='large'
                            data-cy='add-story'
                        />
                    )}
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
