import React, { useContext } from 'react';
import { Dropdown } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import { defaultTemplate } from '../../../lib/botResponse.utils';

import { ProjectContext } from '../../layouts/context';


const ChangeResponseType = (props) => {
    const { name } = props;

    const { upsertResponse } = useContext(ProjectContext);
    const handleChangeResponseType = (e, { value }) => {
        upsertResponse(name, defaultTemplate(value), 0);
    };

    return (
        <>
            <Dropdown
                data-cy='change-response-type'
                icon=''
                className='change-response-type'
                text='Change response type'
                onChange={handleChangeResponseType}
                options={[
                    { value: 'TextPayload', text: 'text' },
                    { value: 'QuickRepliesPayload', text: 'quick reply' },
                    { value: 'TextWithButtonsPayload', text: 'buttons' },
                    { value: 'CarouselPayload', text: 'carousel' },
                    { value: 'CustomPayload', text: 'custom' },
                ]}
            />
        </>
    );
};

ChangeResponseType.propTypes = {
    name: PropTypes.string.isRequired,
};

export default ChangeResponseType;
