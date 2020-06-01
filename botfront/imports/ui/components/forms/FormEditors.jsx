import React from 'react';
import PropTypes from 'prop-types';

import { Loader } from 'semantic-ui-react';
import FormEditorContainer from './FormEditorContainer';

const FormEditors = (props) => {
    const {
        forms,
        slots,
    } = props;
    // if (!forms) return <></>;


    console.log(forms);
    return (
        <>
            <Loader active={!forms} />
            Forms:
            {forms.map(form => <div>{form}</div>)}
            {slots.map(slot => <div>{slot}</div>)}
            {/* {forms && (
                <FormEditorContainer slotName='test' form={forms[0]} />
            )} */}
        </>
    );
};

FormEditors.propTypes = {
    forms: PropTypes.array,
    slots: PropTypes.array,
};

FormEditors.defaultProps = {
    forms: [],
    slots: [],
};

export default FormEditors;
