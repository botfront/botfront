import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Form, Input } from 'semantic-ui-react';


const LookupTableStringEditor = (props) => {
    const {
        item,
        onEdit,
        autoFocus,
        placeholder,
        listAttribute,
        onDone,
    } = props;

    const [inputValue, setInputValue] = useState(
        item[listAttribute]
            ? item[listAttribute]
            : '',
    );

    useEffect(() => {
        if (item[listAttribute]) {
            setInputValue(item[listAttribute]);
        }
    },
    [item]);

    const handleTextChange = (_, { value }) => {
        setInputValue(value);
        onEdit({ ...item, [listAttribute]: value });
    };

    const handleDone = () => {
        const update = { ...item };
        if (inputValue && inputValue.length) {
            update[listAttribute] = inputValue;
            onDone(update);
        } else {
            onDone(update);
        }
    };

    return (
        <Form data-cy='add-value'>
            <Input
                className='entity-synonym-values'
                autoFocus={autoFocus}
                placeholder={placeholder}
                name='synonyms'
                value={inputValue}
                onBlur={handleDone}
                onChange={handleTextChange}
            />
        </Form>
    );
};

LookupTableStringEditor.propTypes = {
    item: PropTypes.object.isRequired,
    onEdit: PropTypes.func,
    autoFocus: PropTypes.bool,
    placeholder: PropTypes.string,
    listAttribute: PropTypes.string,
    onDone: PropTypes.func,
};

LookupTableStringEditor.defaultProps = {
    autoFocus: true,
    onEdit: () => {},
    onDone: () => {},
    placeholder: '',
    listAttribute: '',
};

export default LookupTableStringEditor;
