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
    if (!!text) {
        const textArray = text.split(' ');
        const checkDoubleEntity = [];
        entities.forEach((entity, entityIndex) => {
            let textSlice = text.substring(entity.start, entity.end + 1);
            if (!checkDoubleEntity.includes(textSlice)) {
                checkDoubleEntity.push(textSlice);
                textArray.forEach((word, index) => {
                    if (word === textSlice) {
                        textArray.splice(
                            index,
                            1,
                            <Entity
                                value={{
                                    start: entity.start,
                                    end: entity.end,
                                    value: entity.value,
                                    entity: entity.entity,
                                }}
                                size={size}
                                allowEditing={allowEditing}
                                deletable={allowEditing}
                                onChange={() => onChange({
                                    ...value,
                                    entities: [...value.entities, entity],
                                })
                                }
                                onDelete={() => onChange({
                                    ...value,
                                    entities: [...value.entities.splice(entityIndex)],
                                })
                                }
                            />,
                        );
                        textSlice = '';
                    }
                });
            }
        });
        textArray.forEach((word) => {
            if (typeof word === 'string') {
                displayArray.push(`${word} `);
            } else {
                displayArray.push(word);
            }
        });
    } else {
        entities.forEach((entity) => {
            displayArray.push(
                <Entity
                    entity={{
                        start: entity.start,
                        end: entity.end,
                        value: entity.value,
                        entity: entity.entity,
                    }}
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
