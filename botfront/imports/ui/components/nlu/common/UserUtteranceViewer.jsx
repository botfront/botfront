import React, {
    useState, useContext, useRef, useMemo,
} from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { ProjectContext } from '../../../layouts/context';
import IntentLabel from './IntentLabel';
import EntityLabel from './EntityLabel';

function UserUtteranceViewer(props) {
    const {
        value, onChange, disableEditing, showIntent, disabled, onClick,
    } = props;
    const { text = '', intent = '', entities = [] } = value;
    const [textSelection, setSelection] = useState(null);
    const mouseDown = useRef(false);
    const setMouseDown = (v) => {
        mouseDown.current = v;
    };
    const { entities: contextEntities, addEntity } = useContext(ProjectContext);
    const utteranceViewerRef = useRef();

    const textContent = useMemo(() => {
        // We add the original index to entities for onChange and onDelete methods, then we sort them by order of appearance.
        const sortedEntities = entities
            ? entities
                .map((entity, index) => ({ ...entity, index }))
                .sort((a, b) => {
                    if (a.start !== undefined && b.start !== undefined) {
                        return a.start - b.start;
                    }
                    return 0;
                })
            : [];
        const newTextContent = []; // an ordered list of the utterance cut down into text and entities.
        // if there is no text we can just get the sorted entities.
        if (!text) {
            sortedEntities.forEach((entity) => {
                newTextContent.push({
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
                if (textSelection && i === textSelection.start) {
                    i = textSelection.end;
                    if (currentText.text) newTextContent.push({ ...currentText });
                    delete currentText.text;
                    newTextContent.push({ ...textSelection, type: 'selection' });
                }
                if (sortedEntities[0] && sortedEntities[0].start === i) {
                    i = sortedEntities[0].end - 1;
                    if (currentText.text) {
                        newTextContent.push({ ...currentText });
                        delete currentText.text;
                    }
                    newTextContent.push({
                        ...sortedEntities[0],
                        type: 'entity',
                    });
                    sortedEntities.shift();
                } else {
                    addChar(i);
                }
                if (i === text.length - 1) {
                    if (currentText.text) newTextContent.push({ ...currentText });
                }
            }
        }
        return newTextContent;
    }, [textSelection, entities]);

    const onChangeWrapped = (data) => {
        if (data && data.entities) {
            data.entities.forEach((e) => {
                if (!contextEntities.includes(e.entity)) addEntity(e.entity);
            });
        }
        onChange(data);
    };

    function handleEntityChange(newValue, entityIndex) {
        onChangeWrapped({
            ...value,
            entities: entities.map((e, index) => (entityIndex === index ? newValue : e)),
        });
    }

    function handleEntityDeletion(index) {
        onChangeWrapped({
            ...value,
            entities: [
                ...value.entities.slice(0, index),
                ...value.entities.slice(index + 1),
            ],
        });
    }

    function handleAddEntity(entity) {
        if (!entity || !entity.entity || !entity.entity.trim()) return null;
        if (textSelection) setSelection(null);
        const {
            type: _, text: __, index: ___, ...entityCleaned
        } = entity;
        return onChangeWrapped({
            ...value,
            entities:
                entities instanceof Array
                    ? [entityCleaned, ...entities]
                    : [entityCleaned],
        });
    }

    function adjustBeginning(completeText, anchor) {
        if (/[\W.,?!;:]/.test(completeText.slice(anchor, anchor + 1))) {
            return adjustBeginning(completeText, anchor + 1);
        }
        if (anchor === 0) return anchor;
        if (
            /[\W.,?!;:][a-zA-Z\u00C0-\u017F0-9-]/.test(
                completeText.slice(anchor - 1, anchor + 1),
            )
        ) {
            return anchor;
        }

        return adjustBeginning(completeText, anchor - 1);
    }

    function adjustEnd(completeText, extent) {
        if (/[\W.,?!;:]/.test(completeText.slice(extent - 1, extent))) {
            return adjustEnd(completeText, extent - 1);
        }
        if (extent === completeText.length) return extent;
        if (
            /[a-zA-Z\u00C0-\u017F0-9-][\W.,?!;:]/.test(
                completeText.slice(extent - 1, extent + 1),
            )
        ) {
            return extent;
        }

        return adjustEnd(completeText, extent + 1);
    }

    function handleMouseUp({ shiftKey, ctrlKey, metaKey }, element, exited) {
        const selection = window.getSelection();
        let extraBound = [];
        if (exited) extraBound = exited === 'left' ? [0] : [element.text.length];
        let bad = false;
        let anchor = Math.min(
            element.start + selection.anchorOffset,
            element.start + selection.focusOffset,
            ...extraBound,
        );
        let extent = Math.max(
            element.start + selection.anchorOffset,
            element.start + selection.focusOffset,
            ...extraBound,
        );
        if (anchor === extent) bad = true;
        else {
            anchor = adjustBeginning(text, anchor);
            extent = adjustEnd(text, extent);
        }
        if (
            bad
            || disableEditing
            || selection.type !== 'Range'
            || selection.anchorNode !== selection.focusNode
            || selection.anchorOffset === selection.focusOffset
        ) {
            window.getSelection().removeAllRanges();
            if (textSelection) setSelection(null);
            if (mouseDown.current) {
                // if coming from another row, mouseDown has already been turned to false,
                // so a new mousedown won't be dispatched
                utteranceViewerRef.current.parentNode.dispatchEvent(
                    new MouseEvent('mousedown', {
                        bubbles: true,
                        shiftKey,
                        ctrlKey,
                        metaKey,
                    }),
                );
            }
            setMouseDown(false);
            return;
        }
        setMouseDown(false);
        setSelection({
            text: text.slice(anchor, extent),
            start: anchor,
            end: extent,
        });
    }

    const color = disabled ? { color: 'grey' } : {};

    return (
        <div
            className={`utterance-viewer ${onClick ? 'cursor pointer' : ''}`}
            data-cy='utterance-text'
            {...(onClick ? { onClick } : {})}
            {...{
                onMouseLeave: (e) => {
                    if (
                        Array.from(document.querySelectorAll('.popup')).some(p => p.contains(e.target))
                    ) {
                        return;
                    }
                    if (!mouseDown.current) return;
                    if (Math.abs(e.screenY - mouseDown.current[1]) < 10) {
                        const element = e.screenX - mouseDown.current[0] < 0
                            ? textContent[0]
                            : textContent[textContent.length - 1];
                        handleMouseUp(
                            e,
                            element,
                            e.screenX - mouseDown.current[0] < 0 ? 'left' : 'right',
                        );
                        window.getSelection().removeAllRanges();
                        setMouseDown(false);
                        return;
                    }
                    window.getSelection().removeAllRanges();
                    setMouseDown(false);
                    // dispatch mousedown when exiting row, meaning selection behavior will kick in
                    // in above components
                    utteranceViewerRef.current.parentNode.dispatchEvent(
                        new MouseEvent('mousedown', { bubbles: true }),
                    );
                },
            }}
            {...{
                onMouseUp: (e) => {
                    const { elementStart } = e.target.dataset;
                    if (elementStart) {
                        const element = textContent.find(
                            ({ start }) => start === parseInt(elementStart, 10),
                        );
                        if (element.type === 'text') handleMouseUp(e, element);
                    } else if (utteranceViewerRef.current.contains(e.target)) {
                        const element = e.screenX - mouseDown.current[0] < 0
                            ? textContent[0]
                            : textContent[textContent.length - 1];
                        handleMouseUp(e, element, false);
                    }
                },
            }}
            {...{
                onMouseDown: (e) => {
                    setMouseDown([e.screenX, e.screenY]);
                    if (!disableEditing) e.stopPropagation();
                },
            }}
            ref={utteranceViewerRef}
        >
            {textContent.map(element => (
                <React.Fragment key={`${element.start}-${element.index}`}>
                    {element.type === 'text' && (
                        <span role='application' data-element-start={element.start}>
                            {element.text}
                        </span>
                    )}
                    {element.type === 'entity' && (
                        <span data-element-start={element.start}>
                            <EntityLabel
                                value={{
                                    ...element,
                                    text: text
                                        ? text.slice(element.start, element.end)
                                        : element.value,
                                }}
                                {...color}
                                allowEditing={!disableEditing}
                                deletable={!disableEditing}
                                onDelete={() => handleEntityDeletion(element.index)}
                                onChange={v => handleEntityChange(v, element.index)}
                            />
                        </span>
                    )}
                    {element.type !== 'text' && element.type !== 'entity' && (
                        <EntityLabel
                            value={{ ...element, value: element.text, entity: '' }}
                            customTrigger={(
                                <span
                                    className='selected-text'
                                    role='application'
                                    data-element-start={element.start}
                                >
                                    {element.text}
                                </span>
                            )}
                            openInitially
                            allowEditing={!disableEditing}
                            deletable={!disableEditing}
                            onClose={() => {
                                if (textSelection) setSelection(null);
                            }}
                            onDelete={() => handleEntityDeletion(element.index)}
                            onChange={v => handleAddEntity(v)}
                        />
                    )}
                </React.Fragment>
            ))}
            {showIntent && (
                <div style={{ display: 'inline-block', marginLeft: '10px' }}>
                    {intent && (
                        <IntentLabel
                            value={intent}
                            allowEditing={!disableEditing}
                            allowAdditions
                            onChange={newIntent => onChangeWrapped({ ...value, intent: newIntent })}
                            disabled={disabled}
                        />
                    )}
                </div>
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
