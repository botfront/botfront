import React, { useState, useContext, useRef } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import EntityPopup from '../../example_editor/EntityPopup';
import { ProjectContext } from '../../../layouts/context';
import Intent from './IntentLabel';
import Entity from './EntityLabel';

function UserUtteranceViewer(props) {
    const {
        value, onChange, disableEditing, projectId, showIntent, disabled, onClick,
    } = props;
    const { text, intent, entities } = value;
    const [textSelection, setSelection] = useState(null);
    const mouseDown = useRef(false);
    const setMouseDown = (v) => { mouseDown.current = v; };
    const { entities: contextEntities, addEntity } = useContext(ProjectContext);
    const utteranceViewerRef = useRef();
    const textContent = []; // an ordered list of the utterance cut down into text and entities.
    // We add the original index to entities for onChange and onDelete methods, then we sort them by order of appearance.
    const sortedEntities = entities
        ? entities
            .map((entity, index) => ({ ...entity, index }))
            .sort((a, b) => {
                if (a.start !== undefined && b.start !== undefined) return a.start - b.start;
                return 0;
            })
        : [];

    // if there is no text we can just get the sorted entities.
    if (!text) {
        sortedEntities.forEach((entity) => {
            textContent.push({
                ...entity,
                type: 'entity',
            });
        });
        // If there is a text, we get text elements and entities, sorted in order of appearance.
    } else {
        const currentText = {
            type: 'text',
        };

        const addChar = (index) => {
            const tempText = currentText.text;
            currentText.text = tempText
                ? tempText.concat(text.charAt(index))
                : text.charAt(index);
            if (!tempText) {
                currentText.start = index;
            }
        };

        for (let i = 0; i < text.length; i += 1) {
            if (i === text.length - 1) {
                addChar(i);
                if (currentText.text) textContent.push({ ...currentText });
                break;
            }
            if (textSelection && i === textSelection.start) {
                i = textSelection.end;
                if (currentText.text) textContent.push({ ...currentText });
                delete currentText.text;
                textContent.push({ ...textSelection, type: 'selection' });
            }
            if (sortedEntities[0] && sortedEntities[0].start === i) {
                i = sortedEntities[0].end - 1;
                if (currentText.text) {
                    textContent.push({ ...currentText });
                    delete currentText.text;
                }
                textContent.push({
                    ...sortedEntities[0],
                    type: 'entity',
                });
                sortedEntities.shift();
            } else {
                addChar(i);
            }
        }
    }

    const onChangeWrapped = (data) => {
        data.entities.forEach((e) => {
            if (!contextEntities.includes(e.entity)) addEntity(e.entity);
        });
        onChange(data);
    };

    function handleEntityChange(newValue, entityIndex) {
        return onChangeWrapped({
            ...value,
            entities: entities.map((e, index) => {
                if (entityIndex === index) {
                    return { ...e, entity: newValue };
                }
                return e;
            }),
        });
    }

    function handleEntityDeletion(index) {
        onChange({
            ...value,
            entities: [
                ...value.entities.slice(0, index),
                ...value.entities.slice(index + 1),
            ],
        });
    }

    function handleAddEntity(entity, element) {
        setSelection(null);
        if (!entity || !entity.trim()) return null;
        const newEntity = { ...element };
        delete newEntity.type;
        delete newEntity.text;
        const entityToAdd = { ...newEntity, entity, value: element.text };
        return onChangeWrapped({
            ...value,
            entities: entities instanceof Array ? [entityToAdd, ...entities] : [entityToAdd],
        });
    }

    // This function recursively removes the first non-word characters of a selection
    // until it starts with a word character
    function trimBeginning(completeText, anchor, extent) {
        if (
            anchor === extent
            || (/[a-zA-Z\u00C0-\u017F0-9-]/.test(completeText.slice(anchor, anchor + 1))
                && /[a-zA-Z\u00C0-\u017F0-9-]/.test(completeText.slice(anchor - 1, anchor)))
        ) {
            return false;
        }

        if (
            /[a-zA-Z\u00C0-\u017F0-9-]/.test(completeText.slice(anchor, anchor + 1))
            && /\W/.test(completeText.slice(anchor - 1, anchor))
        ) {
            return anchor;
        }

        return trimBeginning(completeText, anchor + 1, extent);
    }

    // This function recursively removes the last non-word characters of a selection
    // until it ends with a word character
    function trimEnding(completeText, anchor, extent) {
        if (
            anchor === extent
            || (/[a-zA-Z\u00C0-\u017F0-9-]/.test(completeText.slice(extent - 1, extent))
                && /[a-zA-Z\u00C0-\u017F0-9-]/.test(completeText.slice(extent, extent + 1)))
        ) {
            return false;
        }

        if (
            /[a-zA-Z\u00C0-\u017F0-9-]/.test(completeText.slice(extent - 1, extent))
            && /\W/.test(completeText.slice(extent, extent + 1))
        ) {
            return extent;
        }

        return trimEnding(completeText, anchor, extent - 1);
    }

    function getCorrectSelection(completeText, anchor, extent) {
        if (anchor === extent) {
            return false;
        }

        // we check that the characters at the edge of the selection are either
        // next to a non word character or at the edge of the completeText
        const anchorCorrect = (anchor === 0 || /\W/.test(completeText.slice(anchor - 1, anchor)))
            && /[a-zA-Z\u00C0-\u017F0-9-]/.test(completeText.slice(anchor, anchor + 1));
        const extentCorrect = (extent === completeText.length
                || /\W/.test(completeText.slice(extent, extent + 1)))
            && /[a-zA-Z\u00C0-\u017F0-9-]/.test(completeText.slice(extent - 1, extent));

        if (anchorCorrect && extentCorrect) {
            return {
                anchor,
                extent,
            };
        }

        let trimmedAnchor = anchor;
        let trimmedExtent = extent;

        if (!anchorCorrect) {
            trimmedAnchor = trimBeginning(completeText, anchor, extent);
        }

        if (!extentCorrect) {
            trimmedExtent = trimEnding(completeText, anchor, extent);
        }

        if ((!trimmedAnchor && trimmedAnchor !== 0) || !trimmedExtent) {
            return false;
        }

        return {
            anchor: trimmedAnchor + 1,
            extent: trimmedExtent,
        };
    }

    function handleMouseUp({ shiftKey, ctrlKey, metaKey }, element) {
        const selection = window.getSelection();
        const selectionBoundary = getCorrectSelection(
            text,
            Math.min(
                element.start + selection.anchorOffset,
                element.start + selection.focusOffset,
            ),
            Math.max(
                element.start + selection.anchorOffset,
                element.start + selection.focusOffset,
            ),
        );
        if (
            disableEditing
            || selection.type !== 'Range'
            || selection.anchorNode !== selection.focusNode
            || selection.anchorOffset === selection.focusOffset
            || !selectionBoundary
        ) {
            window.getSelection().removeAllRanges();
            setSelection(null);
            if (mouseDown.current) {
                // if coming from another row, mouseDown has already been turned to false,
                // so a new mousedown won't be dispatched
                utteranceViewerRef.current.parentNode.dispatchEvent(new MouseEvent('mousedown', {
                    bubbles: true, shiftKey, ctrlKey, metaKey,
                }));
            }
            setMouseDown(false);
            return;
        }
        setMouseDown(false);
        setSelection({
            text: text.slice(selectionBoundary.anchor, selectionBoundary.extent),
            start: selectionBoundary.anchor,
            end: selectionBoundary.extent,
        });
    }

    const color = disabled ? { color: 'grey' } : {};

    return (
        <div
            className={`utterance-viewer ${onClick ? 'cursor pointer' : ''}`}
            data-cy='utterance-text'
            {...(onClick ? { onClick } : {})}
            {...{
                onMouseLeave: () => {
                    if (!mouseDown.current) return;
                    if (!textSelection) window.getSelection().removeAllRanges();
                    setMouseDown(false);
                    // dispatch mousedown when exiting row, meaning selection behavior will kick in
                    // in above components
                    utteranceViewerRef.current.parentNode.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
                },
            }}
            ref={utteranceViewerRef}
        >
            {textContent.map(element => (
                <React.Fragment key={`${element.start}-${element.index}`}>
                    {element.type === 'text' && (
                        // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
                        <span
                            onMouseDown={(e) => {
                                setMouseDown(true);
                                if (!disableEditing) e.stopPropagation();
                            }}
                            onMouseUp={evt => handleMouseUp(evt, element)}
                            role='application'
                        >
                            {element.text}
                        </span>
                    )}
                    {element.type === 'entity' && (
                        <Entity
                            value={element}
                            size='mini'
                            {...color}
                            allowEditing={!disableEditing}
                            deletable={!disableEditing}
                            onDelete={() => handleEntityDeletion(element.index)}
                            onChange={(_e, { value: newValue }) => handleEntityChange(newValue, element.index)}
                        />
                    )}
                    {element.type !== 'text' && element.type !== 'entity' && (
                        <EntityPopup
                            trigger={(
                                <span
                                    className='selected-text'
                                    role='application'
                                >
                                    {element.text}
                                </span>
                            )}
                            onSelectionReset={() => setSelection(null)}
                            options={contextEntities.map((e => ({ text: e, value: e })))}
                            entity={{ ...element, value: element.text, entity: '' }}
                            length={element.end - element.start}
                            selection
                            onAddOrChange={(_e, data) => handleAddEntity(data.value, element)}
                            projectId={projectId}
                        />
                    )}
                </React.Fragment>
            ))}
            {showIntent && (
                <> &nbsp;&nbsp;&nbsp;
                    {intent && (
                        <Intent
                            value={intent}
                            allowEditing={!disableEditing}
                            allowAdditions
                            onChange={newIntent => onChange({ ...value, intent: newIntent })}
                            disabled={disabled}
                        />
                    )}
                </>
            )}

        </div>
    );
}

UserUtteranceViewer.propTypes = {
    value: PropTypes.object.isRequired,
    disableEditing: PropTypes.bool,
    disabled: PropTypes.bool,
    showIntent: PropTypes.bool,
    onChange: PropTypes.func,
    projectId: PropTypes.string.isRequired,
    onClick: PropTypes.func,
};

UserUtteranceViewer.defaultProps = {
    disableEditing: false,
    showIntent: true,
    disabled: false,
    onChange: () => {},
    onClick: null,
};


const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
});

export default connect(mapStateToProps)(UserUtteranceViewer);
