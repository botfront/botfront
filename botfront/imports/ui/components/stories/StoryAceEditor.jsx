import {
    Popup, Icon, Segment, Menu, Dropdown,
} from 'semantic-ui-react';
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import AceEditor from 'react-ace';
import 'brace/theme/github';
import 'brace/mode/text';

import ConfirmPopup from '../common/ConfirmPopup';

const StoryEditor = ({
    story,
    disabled,
    onChange,
    onDelete,
    annotations,
    title,
    onClone,
    onMove,
    groupNames,
    onRename,
}) => {
    const [deletePopupOpened, openDeletePopup] = useState(false);
    const [movePopupOpened, openMovePopup] = useState(false);
    const [moveDestination, setMoveDestination] = useState(null);
    const [editor, setEditor] = useState();
    const [newTitle, setNewTitle] = useState(title);

    // sets annotations directly on the ace editor, bypassing the react component
    // We bypass react-ace because annotations are buggy on it
    useEffect(() => {
        if (editor) {
            editor.getSession().setAnnotations(annotations);
        }
    }, [annotations, story]);

    useEffect(() => {
        setNewTitle(title);
    }, [title]);

    return (
        <div className='story-editor' data-cy='story-editor'>
            <Menu attached='top'>
                <Menu.Item header>
                    <span className='story-title-prefix'>##</span>
                    <input
                        data-cy='story-title'
                        value={newTitle}
                        onChange={event => setNewTitle(event.target.value)}
                        onBlur={() => {
                            if (title === newTitle) {
                                return;
                            }
                            if (!newTitle.replace(/\s/g, '').length) {
                                setNewTitle(title);
                                return;
                            }
                            onRename(newTitle);
                        }}
                    />
                </Menu.Item>
                <Menu.Item position='right'>
                    <Popup
                        trigger={(
                            <Icon
                                name='dolly'
                                color='grey'
                                link
                                data-cy='move-story'
                            />
                        )}
                        content={(
                            <ConfirmPopup
                                title='Move story to :'
                                content={(
                                    <Dropdown
                                        button
                                        openOnFocus
                                        search
                                        basic
                                        placeholder='Select a group'
                                        fluid
                                        selection
                                        value={moveDestination}
                                        options={groupNames}
                                        onChange={(e, data) => {
                                            setMoveDestination(data.value);
                                        }}
                                        data-cy='move-story-dropdown'
                                    />
                                )}
                                onYes={() => {
                                    if (moveDestination) {
                                        openMovePopup(false);
                                        onMove(moveDestination);
                                    }
                                }}
                                onNo={() => openMovePopup(false)}
                            />
                        )}
                        on='click'
                        open={movePopupOpened}
                        onOpen={() => openMovePopup(true)}
                        onClose={() => openMovePopup(false)}
                    />
                    <Icon
                        name='clone'
                        color='grey'
                        link
                        data-cy='duplicate-story'
                        onClick={onClone}
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
                                onYes={() => {
                                    openDeletePopup(false);
                                    onDelete();
                                }}
                                onNo={() => openDeletePopup(false)}
                            />
                        )}
                        on='click'
                        open={deletePopupOpened}
                        onOpen={() => openDeletePopup(true)}
                        onClose={() => openDeletePopup(false)}
                    />
                </Menu.Item>
            </Menu>
            <Segment attached='bottom'>
                <AceEditor
                    readOnly={disabled}
                    onLoad={setEditor}
                    theme='github'
                    width='100%'
                    name='story'
                    mode='text'
                    minLines={5}
                    maxLines={Infinity}
                    fontSize={12}
                    onChange={onChange}
                    value={story}
                    showPrintMargin={false}
                    showGutter
                    annotations={annotations}
                    editorProps={{
                        $blockScrolling: Infinity,
                    }}
                    setOptions={{
                        tabSize: 2,
                        // the worker has a bug which removes annotations
                        useWorker: false,
                    }}
                />
            </Segment>
        </div>
    );
};

StoryEditor.propTypes = {
    story: PropTypes.string,
    disabled: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    annotations: PropTypes.array,
    title: PropTypes.string.isRequired,
    onClone: PropTypes.func.isRequired,
    onMove: PropTypes.func.isRequired,
    groupNames: PropTypes.array.isRequired,
    onRename: PropTypes.func.isRequired,
};

StoryEditor.defaultProps = {
    disabled: false,
    story: '',
    annotations: [],
};

export default StoryEditor;
