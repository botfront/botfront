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

    function handleEntityChange(newValue, entity) {
        const newEntities = entities.map((e) => {
            if (entity.start === e.start && entity.end === e.end) {
                return { ...e, entity: newValue };
            }
            return e;
        });
        return onChange({ ...value, entities: newEntities });
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
                entities.forEach((entity) => {
                    // eslint-disable-next-line eqeqeq
                    if (entity.start == entry) {
                        displayArray.push(
                            <Entity
                                value={entity}
                                size={size}
                                allowEditing={allowEditing}
                                deletable={allowEditing}
                                onChange={newValue => handleEntityChange(newValue, entity)}
                                onDelete={() => onChange({
                                    ...value,
                                    entities: [
                                        ...value.entities.filter(
                                            e => e.value !== textObject[entry][0],
                                        ),
                                    ],
                                })
                                }
                            />,
                        );
                    }
                });
            } else {
                displayArray.push(`${textObject[entry][0]} `);
            }
        });
    } else {
        entities.forEach((entity) => {
            displayArray.push(
                <Entity
                    value={entity}
                    size={size}
                    allowEditing={allowEditing}
                    deletable={allowEditing}
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
