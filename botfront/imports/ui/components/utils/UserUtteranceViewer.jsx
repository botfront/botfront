import React from 'react';
import PropTypes from 'prop-types';
import Intent from './IntentLabel';
import Entity from './EntityLabel';

function UserUtteranceViewer({
    value, size, onChange, allowEditing,
}) {
    // Intent will always be placed at the end
    const { text, intent, entities } = value;
    const displayArray = [];
    const textObject = {}; // An object with start, end and value of each word in the text
    const entitiesStart = entities.map(entity => entity.start);

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

    // Creating textObject
    if (!!text) {
        for (let char = 0; char < text.length; char += 1) {
            const startChar = char;
            for (let endChar = startChar; endChar < text.length; endChar += 1) {
                if (text.charAt(endChar) === ' ' || endChar === text.length - 1) {
                    if (endChar === text.length - 1) {
                        textObject[startChar] = [
                            text.substring(startChar, endChar + 1),
                            endChar + 1,
                        ];
                    } else {
                        textObject[startChar] = [
                            text.substring(startChar, endChar),
                            endChar,
                        ];
                    }

                    char = endChar;
                    break;
                }
            }
        }

        // Creating displayArray from textObject and entities array.
        Object.keys(textObject).forEach((entry) => {
            if (entitiesStart.includes(parseInt(entry, 10))) {
                entities.forEach((entity, index) => {
                    // eslint-disable-next-line
                    if (entity.value === textObject[entry][0] && entity.start == entry) {
                        displayArray.push(
                            <Entity
                                value={entity}
                                size={size}
                                allowEditing={allowEditing}
                                deletable={allowEditing}
                                onChange={newValue => handleEntityChange(newValue, index)}
                                onDelete={() => handleEntityDeletion(index)}
                            />,
                        );
                    }
                });
            } else {
                displayArray.push(`${textObject[entry][0]} `);
            }
        });
    } else {
        entities.forEach((entity, index) => {
            displayArray.push(
                <Entity
                    value={entity}
                    size={size}
                    allowEditing={allowEditing}
                    deletable={allowEditing}
                    onDelete={() => handleEntityDeletion(index)}
                    onChange={newValue => handleEntityChange(newValue, index)}
                />,
            );
        });
    }

    return (
        <div>
            {displayArray}
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
