import React, { useContext } from 'react';
import { Dropdown } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import { defaultTemplate } from '../../../lib/botResponse.utils';

import { ProjectContext } from '../../layouts/context';


const ChangeResponseType = (props) => {
    const { name, currentType } = props;

    const { upsertResponse } = useContext(ProjectContext);
    const handleChangeResponseType = (e, { value }) => {
        console.log(defaultTemplate(value));
        upsertResponse(name, defaultTemplate(value), 0);
    };

    return (
        <>
            <Dropdown
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
    currentType: PropTypes.string.isRequired,
};

export default ChangeResponseType;
