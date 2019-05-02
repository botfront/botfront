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
        const { onEdit } = this.props;
        const obj = { ...entitySynonym };
        obj.value = event.target.value;

        this.setState({ entitySynonym: obj });

        onEdit(obj);
    };

    handleDone = () => {
        const { onDone } = this.props;
        const { entitySynonym } = this.state;
        const { entitySynonym: entitySynonymProps } = this.props;
        // If the field is empty, we return the initial value
        if (!entitySynonym.value) {
            onDone(entitySynonymProps);
            return;
        }
        onDone(entitySynonym);
    };

    render() {
        const { placeholder } = this.props;
        const { entitySynonym } = this.state;
        return (
            <Input
                className='entity-synonym'
                autoFocus
                placeholder={placeholder}
                name='value'
                value={entitySynonym.value}
                onBlur={this.handleDone}
                onChange={this.handleTextChange}
                fluid
            />);
    }
}

LookupTableValueEditor.propTypes = {
    onEdit: PropTypes.func,
    placeholder: PropTypes.string,
    entitySynonym: PropTypes.object,
    onDone: PropTypes.func,
};

LookupTableValueEditor.defaultProps = {
    entitySynonym: '',
    onEdit: () => {},
    onDone: () => {},
    placeholder: '',
};
