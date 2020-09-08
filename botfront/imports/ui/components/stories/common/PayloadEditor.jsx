import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Grid, Icon } from 'semantic-ui-react';
import IntentLabel from '../../nlu/common/IntentLabel';
import EntityDropdown from '../../nlu/common/EntityDropdown';
import DashedButton from './DashedButton';
import EntityValueEditor from './EntityValueEditor';
import { ProjectContext } from '../../../layouts/context';

const PayloadEditor = (props) => {
    const {
        value: { intent = '', entities = [] },
        onChange,
        disallowAdvancedEditing,
    } = props;

    const handleChangeIntent = value => onChange({ intent: value, entities });

    const handleChangeEntityAtIndex = (value, index) => onChange({
        intent,
        entities: [...entities.slice(0, index), value, ...entities.slice(index + 1)],
    });

    return (
        <div data-cy='payload-editor'>
            <h4 className='payload-title'>Payload</h4>
            <Grid columns={2} className='story-payload-editor'>
                <Grid.Row>
                    <Grid.Column>
                        <IntentLabel
                            value={intent}
                            allowEditing
                            allowAdditions
                            onChange={i => handleChangeIntent(i)}
                        />
                    </Grid.Column>
                </Grid.Row>
                {entities.map((entity, i) => (
                    <Grid.Row className='hoverTarget'>
                        <Grid.Column>
                            <EntityDropdown
                                key={`entityfield-for-${entity.entity}`}
                                allowAdditions
                                onChange={v => handleChangeEntityAtIndex({ ...entity, entity: v }, i)}
                                onAddItem={v => handleChangeEntityAtIndex(
                                    { ...entity, entity: v },
                                    i,
                                )}
                                entity={entity}
                                onClear={() => onChange({
                                    intent,
                                    entities: [
                                        ...entities.slice(0, i),
                                        ...entities.slice(i + 1),
                                    ],
                                })}
                            />
                        </Grid.Column>
                        <Grid.Column className='entity-value-column'>
                            <EntityValueEditor
                                entity={entity}
                                onChange={v => handleChangeEntityAtIndex(v, i)}
                                disallowAdvancedEditing={disallowAdvancedEditing}
                            />
                        </Grid.Column>
                    </Grid.Row>
                ))}
            </Grid>
            {entities.every(e => (e.entity || '').trim()) ? (
                <div className='add-entity-wrap'>
                    <DashedButton
                        data-cy='add-entity'
                        color='blue'
                        size='mini'
                        onClick={() => onChange({
                            intent,
                            entities: [...entities, { entity: '', value: '' }],
                        })}
                    >
                        <Icon name='plus' />
                        Add entity
                    </DashedButton>
                </div>
            ) : (
                <>
                    <br />
                    <br />
                </>
            )}
        </div>
    );
};

PayloadEditor.propTypes = {
    onChange: PropTypes.func,
    value: PropTypes.object,
    disallowAdvancedEditing: PropTypes.bool,
};

PayloadEditor.defaultProps = {
    onChange: () => {},
    value: null,
    disallowAdvancedEditing: true,
};

export default PayloadEditor;
