import React from 'react';
import PropTypes from 'prop-types';
import { Form } from 'semantic-ui-react';
import TextArea from 'react-textarea-autosize';

export default class LookupTableListEditor extends React.Component {
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
        const { listAttribute, onEdit } = this.props;
        const obj = { ...entitySynonym };
        obj[listAttribute] = event.target.value.split(new RegExp('[ ]*[,][ ]*'));

        this.setState({
            entitySynonym: obj,
        });

        onEdit(obj);
    };

    handleKeyDown = (event) => {
        const { entitySynonym } = this.state;
        const { listAttribute, onEdit } = this.props;
        const obj = {
            ...entitySynonym,
        };
        if (
            event.keyCode === 8
            && !entitySynonym[listAttribute][entitySynonym[listAttribute].length - 1]
        ) {
            event.preventDefault();
            obj[listAttribute].pop();
        }

        this.setState({
            entitySynonym: obj,
        });

        onEdit(obj);
    };

    onDone = () => {
        const { onDone, listAttribute, entitySynonym: entitySynonymProps } = this.props;
        const { entitySynonym } = this.state;
        if (
            !entitySynonym[listAttribute].length
            || (entitySynonym[listAttribute].length === 1 && !entitySynonym[listAttribute][0])
        ) {
            onDone(entitySynonymProps);
            return;
        }
        onDone(entitySynonym);
    };

    render() {
        const { entitySynonym } = this.state;
        const { autoFocus, placeholder, listAttribute } = this.props;
        return (
            <Form data-cy='add-value'>
                <TextArea
                    className='lookup-table-values'
                    minRows={1}
                    maxRows={999}
                    autoFocus={autoFocus}
                    placeholder={placeholder}
                    value={
                        entitySynonym && entitySynonym[listAttribute]
                            ? entitySynonym[listAttribute].join(', ')
                            : ''
                    }
                    onBlur={this.onDone}
                    onChange={this.handleTextChange}
                    onKeyDown={this.handleKeyDown}
                />
            </Form>
        );
    }
}

LookupTableListEditor.propTypes = {
    entitySynonym: PropTypes.object.isRequired,
    onEdit: PropTypes.func,
    autoFocus: PropTypes.bool,
    placeholder: PropTypes.string,
    listAttribute: PropTypes.string,
    onDone: PropTypes.func,
};

LookupTableListEditor.defaultProps = {
    autoFocus: true,
    onEdit: () => {},
    onDone: () => {},
    placeholder: '',
    listAttribute: '',
};
