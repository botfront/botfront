import {
    Popup, Icon, Segment, Menu, Dropdown,
} from 'semantic-ui-react';
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import AceEditor from 'react-ace';
import { set as _set } from 'lodash';
import 'brace/theme/github';
import 'brace/mode/text';
import './style.import.less';

import ConfirmPopup from '../common/ConfirmPopup';

const StoryEditorContainer = ({
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
    const BRANCHES = [
        { name: 'bleh' },
        {
            name: 'boo',
            branches: [
                { name: 'branch1' },
                {
                    name: 'branch2',
                    branches: [
                        { name: 'brancha' },
                        { name: 'branchb' },
                        { name: 'branchc' },
                    ],
                },
                { name: 'branch3' },
            ],
        },
        { name: 'bah' },
        { name: 'a' },
        { name: 'b' },
        { name: 'c' },
        { name: 'd' },
        { name: 'e' },
    ];
    const [activePath, setActivePath] = useState();
    const [storyBranches, setStoryBranches] = useState(BRANCHES);

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

    const renderMenu = () => (
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
    );

    const renderAceEditor = () => (
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
    );

    const getNewBranchName = (branches) => {
        const numNewBranches = branches.filter(branch => branch.name.search('New Branch') === 0).length;
        return `New Branch${numNewBranches < 1 ? '' : numNewBranches + 1}`;
    };

    const getBranchesAndIndices = path => path.split('__').slice(1) // gets branches but also indices, useful for setting later
        .reduce((acc, val) => {
            const index = acc.branches.findIndex(b => b.name === val);
            return {
                branches: acc.branches[index].branches,
                indices: [...acc.indices, index],
            };
        }, { branches: storyBranches, indices: [] });

    const handleCreateBranch = (branches, indices) => {
        const path = indices.reduce((acc, val) => `${acc}${acc ? '.' : ''}${val}.branches`, '');
        const newBranch = { name: getNewBranchName(branches) };
        const newBranches = [...storyBranches];
        if (path) _set(newBranches, path, [...branches, newBranch]);
        else newBranches.push(newBranch);
        setStoryBranches(newBranches);
    };

    const renderBranches = (path) => {
        const { branches, indices } = getBranchesAndIndices(path);
        const query = new RegExp(`(${path}__.*?)(__|$)`);
        const queriedPath = activePath || newTitle;
        const nextPath = queriedPath.match(query) && queriedPath.match(query)[1];
        return (
            <>
                {renderAceEditor()}
                { branches && branches.length && (
                    <Menu tabular>
                        { branches.map((branch) => {
                            const childPath = `${path}__${branch.name}`;
                            return (
                                <Menu.Item
                                    key={childPath}
                                    name={branch.name}
                                    active={activePath && (activePath === childPath || activePath.indexOf(`${childPath}__`) === 0)} // activePath starts with branch's path
                                    onClick={() => {
                                        if (activePath && activePath.indexOf(`${childPath}__`) === 0) return; // do no change activePath if clicked branch is an ancestor
                                        setActivePath(childPath);
                                    }}
                                />
                            );
                        })}
                        <Menu.Item key={`${path}-add`} onClick={() => handleCreateBranch(branches, indices)}>
                            <Icon name='plus' />
                        </Menu.Item>
                    </Menu>
                )}
                { branches && branches.length && activePath && nextPath && ( // render branch content
                    renderBranches(nextPath)
                )}
            </>
        );
    };

    return (
        <div className='story-editor' data-cy='story-editor'>
            {renderMenu()}
            <Segment attached='bottom'>
                {renderBranches(newTitle)}
                <br />
            </Segment>
        </div>
    );
};

StoryEditorContainer.propTypes = {
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

StoryEditorContainer.defaultProps = {
    disabled: false,
    story: '',
    annotations: [],
};

export default StoryEditorContainer;
