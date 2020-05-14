import React from 'react';
import PropTypes from 'prop-types';
import {
    Form, Grid, Divider, Button,
} from 'semantic-ui-react';
import PayloadEditor from './PayloadEditor';
import {
    stringPayloadToObject,
    objectPayloadToString,
} from '../../../../lib/story_controller';

function ResponseButtonEditor({
    value: {
        title,
        type = 'postback',
        payload,
        url,
    },
    onChange,
    onDelete,
    onClose,
    showDelete,
    valid,
    noButtonTitle,
}) {
    const options = [
        { text: 'Postback', value: 'postback' },
        { text: 'Web URL', value: 'web_url' },
    ];
    return (
        <Form className='response-button-editor'>
            <Grid columns={16} textAlign='left'>
                <Grid.Row>
                    {!noButtonTitle && (
                        <Grid.Column width={12}>
                            <Form.Input
                                label='Button title'
                                data-cy='enter-button-title'
                                autoFocus
                                placeholder='Button title'
                                onChange={(_event, { value }) => {
                                    const updatedVal = { title: value, type };
                                    if (type === 'web_url') updatedVal.url = url;
                                    else updatedVal.payload = payload;
                                    onChange(updatedVal);
                                }}
                                value={title}
                            />
                        </Grid.Column>
                    )}
                    <Grid.Column width={noButtonTitle ? 6 : 4}>
                        <Form.Select
                            label={noButtonTitle ? 'Type' : 'Button type'}
                            onChange={(event, { value }) => {
                                const updatedVal = { title, type: value };
                                updatedVal.payload = '';
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
                                value={url}
                                onChange={(_event, { value }) => onChange({ title, type, url: value })
                                }
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
                        {showDelete && !noButtonTitle && (
                            <Button
                                basic
                                color='red'
                                icon='trash'
                                content='Delete button'
                                type='button'
                                onClick={onDelete}
                            />
                        )}
                        <Button
                            primary
                            content='Save'
                            data-cy='save-button'
                            disabled={!valid}
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
    value: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    onDelete: PropTypes.func,
    onClose: PropTypes.func.isRequired,
    showDelete: PropTypes.bool,
    valid: PropTypes.bool.isRequired,
    noButtonTitle: PropTypes.bool,
};

ResponseButtonEditor.defaultProps = {
    value: {},
    showDelete: true,
    onDelete: () => {},
    noButtonTitle: false,
};

export default ResponseButtonEditor;
