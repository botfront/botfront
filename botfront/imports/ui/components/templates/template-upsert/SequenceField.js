/* eslint-disable react/prop-types */
import React from 'react';
import connectField from 'uniforms/connectField';
import joinName from 'uniforms/joinName';
import { Container, Grid, Segment } from 'semantic-ui-react';
import ListAddTemplate from './ListAddTemplate';
import ListDelTemplate from './ListDelTemplate';
import SequenceItem from './SequenceItemField';

const SequenceField = ({
    children,
    className,
    disabled,
    error,
    errorMessage,
    initialCount,
    itemProps,
    label,
    name,
    required,
    showInlineError,
    value,
    // eslint-disable-next-line no-unused-vars
    ...props
}) => (
    <>
        {!!(error && showInlineError) && (
            <div className='ui red basic label'>
                {errorMessage}
            </div>
        )}
        {value.map((item, index) => (
            <div className={`response-message-${index}`}>
                <Container textAlign='center'>
                    <ListAddTemplate name={joinName(name, index)} insert />
                </Container>
                <Segment>
                    <Grid>
                        <Grid.Row>
                            <Grid.Column width={15}>
                                <SequenceItem
                                    style={{ marginTop: '2px' }}
                                    label={null}
                                    name={`${joinName(name, index)}.content`}
                                    {...itemProps}
                                />
                            </Grid.Column>
                            <Grid.Column width={1}>
                                <ListDelTemplate name={joinName(name, index)} />
                            </Grid.Column>
                        </Grid.Row>
                    </Grid>
                </Segment>
            </div>
        ))}
        <Container textAlign='center' className='response-message-next'>
            <ListAddTemplate name={joinName(name, value.length)} />
        </Container>
    </>
);

export default connectField(SequenceField, { ensureValue: true, includeInChain: false });
