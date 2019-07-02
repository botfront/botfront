import {
    Popup, Icon, Segment, Menu, Dropdown,
} from 'semantic-ui-react';
import React, { useState } from 'react';
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
}) => {
    const [deletePopupOpened, openDeletePopup] = useState(false);
    const [clonePopupOpened, openClonePopup] = useState(false);
    const [movePopupOpened, openMovePopup] = useState(false);

    return (
        <div className='story-editor' data-cy='story-editor'>
            <Menu attached='top'>
                <Menu.Item header>{`## ${title}`}</Menu.Item>
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
                                onYes={() => {
                                    openMovePopup(false);
                                    onMove();
                                }}
                                content={(
                                    <Dropdown
                                        button
                                        search
                                        basic
                                        fluid
                                        selection
                                        options={groupNames.map(name => ({
                                            text: name,
                                            value: name,
                                        }))}
                                    />
                                )}
                                onNo={() => openMovePopup(false)}
                            />
                        )}
                        on='click'
                        open={movePopupOpened}
                        onOpen={() => openMovePopup(true)}
                        onClose={() => openMovePopup(false)}
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
                    <Popup
                        trigger={(
                            <Icon
                                name='clone'
                                color='grey'
                                link
                                data-cy='duplicate-story'
                            />
                        )}
                        content={(
                            <ConfirmPopup
                                title='Clone story ?'
                                onYes={() => {
                                    openClonePopup(false);
                                    onClone();
                                }}
                                onNo={() => openClonePopup(false)}
                            />
                        )}
                        on='click'
                        open={clonePopupOpened}
                        onOpen={() => openClonePopup(true)}
                        onClose={() => openClonePopup(false)}
                    />
                </Menu.Item>
            </Menu>
            <Segment attached='bottom'>
                <AceEditor
                    readOnly={disabled}
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
                    // We use ternary expressions here to prevent wrong prop types
                    annotations={annotations}
                    editorProps={{
                        $blockScrolling: Infinity,
                    }}
                    setOptions={{
                        tabSize: 2,
                    }}
                />
            </Segment>
        </div>
    );
};

StoryEditor.propTypes = {
    story: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    annotations: PropTypes.array,
    title: PropTypes.string.isRequired,
    onClone: PropTypes.func.isRequired,
    onMove: PropTypes.func.isRequired,
    groupNames: PropTypes.array.isRequired,
};

StoryEditor.defaultProps = {
    disabled: false,
    annotations: [],
};

export default StoryEditor;
