import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Grid, Icon, Input } from 'semantic-ui-react';
import IntentDropdown from '../../nlu/common/IntentDropdown';
import EntityDropdown from '../../nlu/common/EntityDropdown';
import FloatingIconButton from '../../common/FloatingIconButton';
import DashedButton from './DashedButton';
import { ProjectContext } from '../../../layouts/context';

const PayloadEditor = (props) => {
    const {
        intents: availableIntents,
        entities: availableEntities,
        addIntent,
        addEntity,
    } = useContext(ProjectContext);
    const {
        value: { intent, entities: originalEntities },
        autofocusOnIntent,
        onChange,
    } = props;
    const entities = originalEntities.map(oe => ({
        entity: oe.entity,
        value: oe.entity,
        entityValue: oe.value,
    }));
    const intentOptions = [...new Set([...availableIntents, intent])].map(i => ({
        text: i,
        value: i,
    }));

    const getEntitiesInRasaFormat = ents => ents.map(({ entity, entityValue }) => ({
        entity,
        value: entityValue,
    }));

    function handleAddOrChangeIntent(value) {
        onChange({
            intent: value,
            entities: getEntitiesInRasaFormat(entities),
        });
    }

    function handleAddOrChangeEntity(currentEntity, newEntity, index) {
        const newEntities = [
            ...originalEntities.slice(0, index),
            { entity: newEntity, value: currentEntity.entityValue },
            ...originalEntities.slice(index + 1),
        ];
        onChange({ intent, entities: newEntities });
    }

    return (
        <div>
            <h4 className='payload-title'>Payload</h4>
            <Grid columns={2} className='story-payload-editor'>
                <Grid.Row>
                    <Grid.Column>
                        <IntentDropdown
                            options={intentOptions}
                            allowAdditions
                            onChange={(_event, { value }) => {
                                handleAddOrChangeIntent(value);
                            }}
                            onAddItem={(_event, { value }) => {
                                addIntent(value);
                                handleAddOrChangeIntent(value);
                            }}
                            intent={intent}
                            autofocus={autofocusOnIntent && !intent}
                        />
                    </Grid.Column>
                </Grid.Row>
                {entities.map((entity, i) => (
                    <Grid.Row className='hoverTarget'>
                        <Grid.Column>
                            <EntityDropdown
                                key={`entityfield-for-${entity.entity}`}
                                options={[...availableEntities, entity.entity]
                                    .filter(
                                        e => e === entity.entity
                                            || !entities.map(f => f.entity).includes(e),
                                    )
                                    .map(e => ({ entity: e, value: e }))}
                                allowAdditions
                                onChange={(_event, { value: newEntity }) => {
                                    handleAddOrChangeEntity(entity, newEntity, i);
                                }}
                                onAddItem={(_event, { value: newEntity }) => {
                                    addEntity(newEntity);
                                    handleAddOrChangeEntity(entity, newEntity, i);
                                }}
                                entity={entity}
                                autofocus
                            />
                        </Grid.Column>
                        <Grid.Column>
                            <Input
                                key={`value-for-${entity.entity}`}
                                value={entity.entityValue}
                                onChange={(e, { value }) => {
                                    const newEnts = [
                                        ...originalEntities.slice(0, i),
                                        { ...entity, value },
                                        ...originalEntities.slice(i + 1),
                                    ];
                                    onChange({ intent, entities: newEnts });
                                }}
                            />
                            <FloatingIconButton
                                icon='trash'
                                onClick={() => {
                                    const newEnts = [
                                        ...originalEntities.slice(0, i),
                                        ...originalEntities.slice(i + 1),
                                    ];
                                    onChange({ intent, entities: newEnts });
                                }}
                            />
                        </Grid.Column>
                    </Grid.Row>
                ))}
            </Grid>
            {entities.every(e => e.entityValue && e.entityValue.trim() !== '') ? (
                <div className='add-entity-wrap'>
                    <DashedButton
                        color='blue'
                        size='mini'
                        onClick={() => onChange({
                            intent,
                            entities: [
                                ...getEntitiesInRasaFormat(entities),
                                { entity: '', value: '' },
                            ],
                        })
                        }
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
    autofocusOnIntent: PropTypes.bool,
};

PayloadEditor.defaultProps = {
    onChange: () => {},
    value: { intent: '', entities: [] },
    autofocusOnIntent: true,
};

export default PayloadEditor;
