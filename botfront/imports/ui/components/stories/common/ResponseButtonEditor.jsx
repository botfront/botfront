import React from 'react';
import PropTypes from 'prop-types';
import {
    Form, Grid, Divider, Button,
} from 'semantic-ui-react';
import PayloadEditor from './PayloadEditor';
import {
    stringPayloadToObject,
    objectPayloadToString,
} from '../../../../lib/story_validation';

function ResponseButtonEditor({
    value: {
        title, type, payload, url, // eslint-disable-line camelcase
    },
    onChange,
    onDelete,
    onClose,
    showDelete,
    valid,
}) {
    const options = [
        { text: 'Postback', value: 'postback' },
        { text: 'Web URL', value: 'web_url' },
    ];
    return (
        <Form className='response-button-editor'>
            <Grid columns={16} textAlign='left'>
                <Grid.Row>
                    <Grid.Column width={12}>
                        <Form.Input
                            label='Button title'
                            data-cy='enter-button-title'
                            autoFocus
                            placeholder='Button title'
                            onChange={(event, { value }) => {
                                const updatedVal = { title: value, type };
                                if (type === 'web_url') updatedVal.url = url;
                                else updatedVal.payload = payload;
                                onChange(updatedVal);
                            }}
                            value={title}
                        />
                    </Grid.Column>
                    <Grid.Column width={4}>
                        <Form.Select
                            label='Button type'
                            onChange={(event, { value }) => {
                                const updatedVal = { title, type: value };
                                if (value === 'web_url') updatedVal.url = '';
                                else updatedVal.payload = '';
                                onChange(updatedVal);
                            }}
                            value={type}
                            options={options}
                            data-cy='select-button-type'
                        />
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row columns={16}>
                    <Grid.Column width={16}>
                        {type === 'web_url' && (
                            <Form.Input
                                label='URL'
                                placeholder='http://'
                                value={payload}
                                onChange={(event, { value }) => onChange({ title, type, url: value })}
                                data-cy='enter_url'
                            />
                        )}
                        {type === 'postback' && (
                            <>
                                <PayloadEditor
                                    value={stringPayloadToObject(payload)}
                                    // onChange={pl => onChange({ title, type, payload: objectPayloadToString(pl) })}
                                    autofocusOnIntent={false}
                                    onChange={pl => onChange({
                                        title,
                                        type,
                                        payload: objectPayloadToString(pl),
                                    })
                                    }
                                />
                            </>
                        )}
                        <Divider />
                        {showDelete && (
                            <Button
                                basic
                                color='red'
                                icon='trash'
                                content='Delete button'
                                size='mini'
                                onClick={onDelete}
                            />
                        )}
                        <Button
                            primary
                            content='Save'
                            data-cy='save-button'
                            disabled={!valid}
                            size='mini'
                            onClick={onClose}
                            floated='right'
                        />
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        </Form>
    );
}

ResponseButtonEditor.propTypes = {
    value: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    showDelete: PropTypes.bool,
    valid: PropTypes.bool.isRequired,
};

ResponseButtonEditor.defaultProps = {
    showDelete: true,
};

export default ResponseButtonEditor;
