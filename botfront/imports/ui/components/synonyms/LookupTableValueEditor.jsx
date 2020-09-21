import React from 'react';
import PropTypes from 'prop-types';
import { Input } from 'semantic-ui-react';

export default class LookupTableValueEditor extends React.Component {
    constructor(props) {
        super(props);
        const { entitySynonym } = this.props;
        this.state = { entitySynonym };
    }

    componentWillReceiveProps(props) {
        this.props = props;
        const { entitySynonym } = this.props;
        this.setState({ entitySynonym });
    }

    handleTextChange = (event) => {
        const { entitySynonym } = this.state;
        const { onEdit, keyAttribute } = this.props;
        const obj = { ...entitySynonym };
        obj[keyAttribute] = event.target.value;

        this.setState({ entitySynonym: obj });
        onEdit(obj);
    };

    handleDone = () => {
        const { onDone, keyAttribute } = this.props;
        const { entitySynonym } = this.state;
        const { entitySynonym: entitySynonymProps } = this.props;
        // If the field is empty, we return the initial value
        if (!entitySynonym[keyAttribute]) {
            onDone(entitySynonymProps);
            return;
        }
        onDone(entitySynonym);
    };

    render() {
        const { placeholder, keyAttribute, autoFocus } = this.props;
        const { entitySynonym } = this.state;
        console.log(keyAttribute);
        return (
            <Input
                className='entity-synonym'
                autoFocus={autoFocus}
                placeholder={placeholder}
                name='value'
                value={entitySynonym[keyAttribute]}
                onBlur={this.handleDone}
                onChange={this.handleTextChange}
                fluid
                data-cy='key-input'
            />
        );
    }
}

LookupTableValueEditor.propTypes = {
    onEdit: PropTypes.func,
    placeholder: PropTypes.string,
    entitySynonym: PropTypes.object,
    onDone: PropTypes.func,
    keyAttribute: PropTypes.string.isRequired,
    autoFocus: PropTypes.bool,
};

LookupTableValueEditor.defaultProps = {
    entitySynonym: '',
    onEdit: () => {},
    onDone: () => {},
    placeholder: '',
    autoFocus: true,
};
