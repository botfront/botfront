import React from "react";
import PropTypes from "prop-types"
import {Input, Dropdown} from "semantic-ui-react";
import getColor from "../../../../lib/getColors";

export default class Filters extends React.Component {

    constructor(props) {
        super(props);
        this.props = props;
        this.state = {
            active:false
        };
    }

    getIntentsOptions = () => this.props.intents.map(i=> {return {text: i, value: i}});

    getEntitiesOptions = () => this.props.entities.map(e=> {return {text: e, value: e}});


    handleIntentSelectorChange = (e, {value}) => {
        this.props.onChange({intents: value, entities:this.props.filter.entities});
    };

    handleEntitiesSelectorChange = (e, {value}) => {
        this.props.onChange({intents:this.props.filter.intents, entities: value});
    };

    render() {
        const renderIntentLabel = label => ({ color: 'purple', content: `${label.text}` });
        const renderEntityLabel = label => ({ color: getColor(this.props.entities.indexOf(label.text), true), content: `${label.text}`});

        return  <div style={{marginRight: '10px'}}>
            {this.props.intents.length > 0 &&<Dropdown style={{marginRight: '10px'}}
                        placeholder='Filter by intents'
                        size="tiny"
                        onChange = {this.handleIntentSelectorChange}
                        multiple
                        value={this.props.filter.intents}
                        search
                        selection
                        renderLabel={renderIntentLabel}
                        options={this.getIntentsOptions()}/>}
            {this.props.entities.length > 0 &&
                    <Dropdown style={{marginRight: '10px'}}
                        placeholder='Filter by entities'
                        size="tiny"
                        onChange={this.handleEntitiesSelectorChange}
                        value={this.props.filter.entities}
                        multiple
                        search
                        selection

                        renderLabel={renderEntityLabel}
                        options={this.getEntitiesOptions()}/>}

            {/*<Input icon='search' placeholder='Search...' onChange={this.handleTextChange} />*/}
        </div>
    }
}

Filters.propTypes = {
    intents: PropTypes.array.isRequired,
    entities: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
    filter: PropTypes.object
};