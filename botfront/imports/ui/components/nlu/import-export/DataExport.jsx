import React from 'react';
import PropTypes from 'prop-types';
import {
    Button, Checkbox, Dropdown, Icon, Tab,
} from 'semantic-ui-react';
import { saveAs } from 'file-saver';
import moment from 'moment';
import { getTrainingDataInRasaFormat } from '../../../../api/instances/instances.methods';

export default class DataExport extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.getInitialState();
    }

    getInitialState() {
        return {
            allIntents: true,
            intents: [],
            synonymsEnabled: true,
            gazetteEnabled: true,
        };
    }

    downloadModelData = () => {
        const { synonymsEnabled, intents, gazetteEnabled } = this.state;
        const { model } = this.props;
        const data = JSON.stringify(getTrainingDataInRasaFormat(model, synonymsEnabled, intents, false, undefined, gazetteEnabled), null, 2);
        const blob = new Blob([data], { type: 'text/plain;charset=utf-8' });
        const filename = `${model.name.toLowerCase()}-${moment().toISOString()}.json`;
        saveAs(blob, filename);
    };

    toggleIntentSelection = () => {
        this.setState(state => ({
            intents: state.allIntents ? state.intents : [],
            allIntents: !state.allIntents,
            synonymsEnabled: state.allIntents && state.synonymsEnabled ? !state.synonymsEnabled : state.synonymsEnabled,
            gazetteEnabled: state.allIntents && state.gazetteEnabled ? !state.gazetteEnabled : state.gazetteEnabled,
        }));
    };

    toggleSynonyms = () => {
        this.setState(state => ({ synonymsEnabled: !state.synonymsEnabled }));
    };

    handleIntentSelectorChange = (e, { value }) => {
        this.setState({
            intents: value,
        });
    };

    toggleGazetteExport = () => {
        this.setState(state => ({ gazetteEnabled: !state.gazetteEnabled }));
    };

    render() {
        const { synonymsEnabled, gazetteEnabled, allIntents } = this.state;
        const { intents } = this.props;
        return (
            <Tab.Pane>
                <br /><br />
                <Checkbox label='Export synonyms' checked={synonymsEnabled} slider onChange={this.toggleSynonyms} />
                <br /><br /><br /><br />
                <Checkbox label='Export gazettes' checked={gazetteEnabled} slider onChange={this.toggleGazetteExport} />
                <br /><br /><br /><br />
                <Checkbox label='Export all intents' checked={allIntents} slider onChange={this.toggleIntentSelection} />
                {!allIntents
                    && (
                        <div><br /><br />
                            <Dropdown
                                placeholder='Select intents to export'
                                multiple
                                selection
                                onChange={this.handleIntentSelectorChange}
                                options={intents.map(i => ({ text: i, value: i }))}
                            />
                        </div>
                    )}
                <br /><br /><br /><br />
                <Button onClick={this.downloadModelData}><Icon name='download' />Export Training Data</Button>
                <br />
            </Tab.Pane>
        );
    }
}

DataExport.propTypes = {
    model: PropTypes.object.isRequired,
    intents: PropTypes.array.isRequired,
};
