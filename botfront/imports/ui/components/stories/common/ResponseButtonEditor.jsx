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
    value: { title, type, payload },
    onChange,
    onDelete,
    onClose,
    showDelete,
    valid,
}) {
    const options = [
        { text: 'Postback', value: 'postback' },
        { text: 'Web URL', value: 'url' },
    ];
    return (
        <Form className='response-button-editor'>
            <Grid columns={16} textAlign='left'>
                <Grid.Row>
                    <Grid.Column width={12}>
                        <Form.Input
                            label='Button title'
                            autoFocus
                            placeholder='Button title'
                            onChange={(event, { value }) => onChange({ title: value, type, payload })
                            }
                            value={title}
                        />
                    </Grid.Column>
                    <Grid.Column width={4}>
                        <Form.Select
                            label='Button type'
                            onChange={(event, { value }) => onChange({ title, type: value, payload: '' })
                            }
                            value={type}
                            options={options}
                        />
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row columns={16}>
                    <Grid.Column width={16}>
                        {type === 'url' && (
                            <Form.Input
                                label='URL'
                                placeholder='http://'
                                value={payload}
                                onChange={(event, { value }) => onChange({ title, type, payload: value })
                                }
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
                                danger
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
    value: PropTypes.shape({
        title: PropTypes.string.isRequired,
        type: PropTypes.oneOf(['postback', 'url']),
        payload: PropTypes.string.isRequired,
    }).isRequired,
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
