import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';

import EntityPopup from '../example_editor/EntityPopup';
import { ConversationOptionsContext } from './Context';
import Intent from './IntentLabel';
import Entity from './EntityLabel';

function UserUtteranceViewer({
    value, size, onChange, allowEditing,
}) {
    const { text, intent, entities } = value;
    const [textSelection, setSelection] = useState(null);
    const { entities: contextEntities } = useContext(ConversationOptionsContext);
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

    function handleEntityChange(newValue, entityIndex) {
        return onChange({
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
        return onChange({
            ...value,
            entities: entities instanceof Array ? [entityToAdd, ...entities] : [entityToAdd],
        });
    }

    // This function recursively removes the first non-word characters of a selection
    // until it starts with a word character
    function trimBeginning(completeText, anchor, extent) {
        if (
            anchor === extent
            || (/\w/.test(completeText.slice(anchor, anchor + 1))
                && /\w/.test(completeText.slice(anchor - 1, anchor)))
        ) {
            return false;
        }

        if (
            /\w/.test(completeText.slice(anchor, anchor + 1))
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
            || (/\w/.test(completeText.slice(extent - 1, extent))
                && /\w/.test(completeText.slice(extent, extent + 1)))
        ) {
            return false;
        }

        if (
            /\w/.test(completeText.slice(extent - 1, extent))
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
            && /\w/.test(completeText.slice(anchor, anchor + 1));
        const extentCorrect = (extent === completeText.length
                || /\W/.test(completeText.slice(extent, extent + 1)))
            && /\w/.test(completeText.slice(extent - 1, extent));

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
            anchor: trimmedAnchor,
            extent: trimmedExtent,
        };
    }

    function handleMouseUp(element) {
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
            !allowEditing
            || selection.anchorNode !== selection.focusNode
            || selection.anchorOffset === selection.focusOffset
            || !selectionBoundary
        ) {
            setSelection(null);
            return;
        }
        setSelection({
            text: selection.toString(),
            start: selectionBoundary.anchor,
            end: selectionBoundary.extent,
        });
    }

    return (
        <div className='utterance-viewer'>
            {textContent.map((element) => {
                if (element.type === 'text') {
                    return (
                        // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
                        <span
                            key={element.start}
                            onMouseUp={() => handleMouseUp(element)}
                            role='application'
                        >
                            {element.text}
                        </span>
                    );
                }
                if (element.type === 'entity') {
                    return (
                        <Entity
                            value={element}
                            size={size}
                            key={element.start}
                            allowEditing={allowEditing}
                            deletable={allowEditing}
                            onDelete={() => handleEntityDeletion(element.index)}
                            onChange={newValue => handleEntityChange(newValue, element.index)
                            }
                        />
                    );
                }
                return (
                    <EntityPopup
                        trigger={(
                            // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
                            <span
                                className='selected-text'
                                onMouseUp={() => setSelection(null)}
                                role='application'
                            >
                                {element.text}
                            </span>
                        )}
                        onSelectionReset={() => setSelection(null)}
                        options={contextEntities}
                        entity={{ ...element, value: element.text, entity: '' }}
                        length={element.end - element.start}
                        selection
                        key={element.start}
                        onAddOrChange={(_e, data) => handleAddEntity(data.value, element)}
                    />
                );
            })}
            {intent && (
                <Intent
                    value={intent}
                    size={size}
                    allowEditing={allowEditing}
                    allowAdditions
                    onChange={newIntent => onChange({ ...value, intent: newIntent })}
                />
            )}
        </div>
    );
}

UserUtteranceViewer.propTypes = {
    value: PropTypes.object.isRequired,
    size: PropTypes.string,
    allowEditing: PropTypes.bool,
    onChange: PropTypes.func,
};

UserUtteranceViewer.defaultProps = {
    size: 'mini',
    allowEditing: true,
    onChange: () => {},
};

export default UserUtteranceViewer;
