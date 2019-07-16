import React, { useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Grid, Icon, Input } from 'semantic-ui-react';
import IntentDropdown from '../../nlu/common/IntentDropdown';
import EntityDropdown from '../../nlu/common/EntityDropdown';
import TrashBin from '../../nlu/common/TrashBin';
import DashedButton from './DashedButton';
import './style.less';
import Context from './Context';

const PayloadEditor = (props) => {
    const { intents: availableIntents, entities: availableEntities } = useContext(Context);
    const { value: { intent: propIntent, entities: propEntities }, onChange } = props;
    const [intent, setIntent] = useState(propIntent);
    const [entities, setEntities] = useState(propEntities);
    useEffect(() => {
        setIntent(propIntent);
        setEntities(propEntities);
    }, [propIntent, propEntities]);

    return (
        <div>
            <h4>Payload</h4>
            <Grid columns={2}>
                <Grid.Row style={{ paddingBottom: '0' }}>
                    <Grid.Column>
                        <IntentDropdown
                            options={availableIntents}
                            allowAdditions={false}
                            onChange={(event, { value }) => { setIntent(value); onChange({ intent: value, entities }); }}
                            intent={intent}
                            autofocus={!intent}
                        />
                    </Grid.Column>
                </Grid.Row>
                { entities.map((entity, i) => (
                    <Grid.Row style={{ paddingBottom: '0' }}>
                        <Grid.Column>
                            <EntityDropdown
                                key={`entityfield-for-${entity.entity}`}
                                options={availableEntities.filter(e => e.entity === entity.entity || !entities.map(f => f.entity).includes(e.entity))}
                                allowAdditions={false}
                                onChange={(event, { value }) => {
                                    const newEnts = [
                                        ...entities.slice(0, i),
                                        { ...entity, entity: value, value },
                                        ...entities.slice(i + 1),
                                    ];
                                    setEntities(newEnts);
                                    onChange({ intent, entities: newEnts });
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
                                        ...entities.slice(0, i),
                                        { ...entity, entityValue: value },
                                        ...entities.slice(i + 1),
                                    ];
                                    setEntities(newEnts);
                                    onChange({ intent, entities: newEnts });
                                }}
                                style={{ width: 'calc(100% - 32px)' }}
                            />
                            <TrashBin
                                style={{ lineHeight: '2.5em' }}
                                onClick={() => {
                                    const newEnts = [
                                        ...entities.slice(0, i),
                                        ...entities.slice(i + 1),
                                    ];
                                    setEntities(newEnts);
                                    onChange({ intent, entities: newEnts });
                                }}
                            />
                        </Grid.Column>
                    </Grid.Row>
                ))}
            </Grid>
            { availableEntities.length > entities.length
                ? (
                    <div style={{ paddingTop: '2em' }}>
                        <DashedButton
                            color='blue'
                            size='mini'
                            onClick={() => setEntities([...entities, { entity: null, value: null, entityValue: null }])}
                        >
                            <Icon name='plus' />Add entity
                        </DashedButton>
                    </div>
                ) : null }
        </div>
    );
};

PayloadEditor.propTypes = {
    onChange: PropTypes.func,
    value: PropTypes.object,
};

PayloadEditor.defaultProps = {
    onChange: () => {},
    value: { intent: null, entities: [] },
};

export default PayloadEditor;
