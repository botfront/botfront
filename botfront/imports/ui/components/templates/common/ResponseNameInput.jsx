import React from 'react';
import PropTypes from 'prop-types';
import {
    Input, Popup, Icon,
} from 'semantic-ui-react';


const ResponseNameInput = (props) => {
    const {
        renameable,
        onChange,
        saveResponseName,
        errorMessage,
        responseName,
        disabledMessage,
        className,
    } = props;
    return (
        <Popup
            inverted
            disabled={renameable || !disabledMessage}
            trigger={(
                // disabling the trigger of a popup prevents it from appearing,
                // wrapping the trigger in a div allows it to show while the input is disabled
                <div className={className}>
                    <Input
                        className='response-name'
                        placeholder='utter_response_name'
                        value={responseName}
                        onChange={onChange}
                        onBlur={saveResponseName}
                        disabled={!renameable}
                        error={!!errorMessage}
                        data-cy='response-name-input'
                    />
                    {errorMessage && (
                        <Popup
                            trigger={<Icon name='exclamation circle' color='red' data-cy='response-name-error' />}
                            content={errorMessage}
                        />
                    )}
                </div>
            )}
            content={disabledMessage}
        />
    );
};

ResponseNameInput.propTypes = {
    renameable: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    saveResponseName: PropTypes.func.isRequired,
    errorMessage: PropTypes.string,
    responseName: PropTypes.string.isRequired,
    disabledMessage: PropTypes.string,
    className: PropTypes.string,
};

ResponseNameInput.defaultProps = {
    disabledMessage: undefined,
    errorMessage: undefined,
    renameable: false,
    onChange: () => {},
    saveResponseName: () => {},
    className: '',
};

export default ResponseNameInput;
