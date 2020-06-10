import React, { useContext, useState } from 'react';
import { Dropdown, Confirm } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import { defaultTemplate } from '../../../lib/botResponse.utils';

import { ProjectContext } from '../../layouts/context';


const ChangeResponseType = (props) => {
    const { name, currentResponseType } = props;
    const [selectedType, setSelectedType] = useState();

    const { upsertResponse } = useContext(ProjectContext);
    const handleChangeResponseType = () => {
        upsertResponse(name, defaultTemplate(selectedType), 0);
        setSelectedType(null);
    };

    const handleSelectType = (e, { value }) => {
        if (value === currentResponseType) return;
        setSelectedType(value);
    };

    return (
        <>
            <Dropdown
                data-cy='change-response-type'
                icon=''
                className='change-response-type'
                text='Change response type'
                onChange={handleSelectType}
                options={[
                    { value: 'TextPayload', text: 'text' },
                    { value: 'QuickRepliesPayload', text: 'quick reply' },
                    { value: 'TextWithButtonsPayload', text: 'buttons' },
                    { value: 'CarouselPayload', text: 'carousel' },
                    { value: 'CustomPayload', text: 'custom' },
                ]}
            />
            <Confirm
                open={!!selectedType}
                header='Warning!'
                content='Are you sure you want to change the response type? The current response will be deleted.'
                onConfirm={handleChangeResponseType}
                onCancel={() => setSelectedType(null)}
            />
        </>
    );
};

ChangeResponseType.propTypes = {
    name: PropTypes.string.isRequired,
    currentResponseType: PropTypes.string,
};

ChangeResponseType.defaultProps = {
    currentResponseType: '',
};

export default ChangeResponseType;
