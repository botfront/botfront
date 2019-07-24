import React from 'react';
import PropTypes from 'prop-types';
import Intent from './IntentLabel';
import Entity from './EntityLabel';

function UserUtteranceViewer({
    value, size, onChange, allowEditing,
}) {
    const { text, intent, entities } = value;
    const textContent = []; // an ordered list of the utterance cut down into text and entities.
    // We add the original index to entities for onChange and onDelete methods, then we sort them by order of appearance.
    const sortedEntities = entities
        ? entities
            .map((entity, index) => ({ ...entity, index }))
            .sort((a, b) => {
                if (a.start && b.start) return a.start - b.start;
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
                textContent.push({ ...currentText });
                break;
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

    return (
        <div>
            {textContent.map((element) => {
                if (element.type === 'text') {
                    return <span key={element.start}>{element.text}</span>;
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
