import React from 'react';
import PropTypes from 'prop-types';
import {
    Dropdown, Segment, Button,
} from 'semantic-ui-react';

class PrefixDropdown extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            isOpen: false,
        };
    }

    getText = (selection) => {
        const { options } = this.props;
        const selectedOption = options
            .find(({ value }) => value === selection);
        return selectedOption ? selectedOption.text : undefined;
    }

    render () {
        const {
            selection, updateSelection, options, prefix,
        } = this.props;
        const { isOpen } = this.state;

        return (
            <div className='prefix-dropdown-container'>
                <Button.Group className='prefix-dropdown' basic onClick={() => { this.setState({ isOpen: !isOpen }); }}>
                    <Dropdown
                        onClick={() => { this.setState({ isOpen: !isOpen }); }}
                        open={isOpen}
                        floating
                        className='button icon'
                        value={selection}
                        trigger={(
                            <Segment className='button prefix-dropdown-trigger' data-cy='sort-utterances-dropdown'>
                                {`${prefix}: ` || ''}
                                <b>
                                    {this.getText(selection)}
                                </b>
                            </Segment>
                        )}
                        options={options}
                        onChange={(e, option) => {
                            this.setState({ isOpen: false });
                            updateSelection(option);
                        }}
                    />
                </Button.Group>
            </div>
        );
    }
}

PrefixDropdown.propTypes = {
    selection: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    updateSelection: PropTypes.func.isRequired,
    options: PropTypes.array.isRequired,
    prefix: PropTypes.string,
};

PrefixDropdown.defaultProps = {
    prefix: '',
    selection: undefined,
};


export default PrefixDropdown;
