import React from 'react';
import PropTypes from 'prop-types';
import { Button, Checkbox, Dropdown, Icon, Tab } from 'semantic-ui-react';
import { saveAs } from 'file-saver';
import moment from 'moment';
import { getTrainingDataInRasaFormat } from '../../../../lib/nlu_methods';

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
        }
    }

    downloadModelData = () => {
        const { synonymsEnabled, intents, gazetteEnabled } = this.state;
        const { model } = this.props;
        const data = JSON.stringify(getTrainingDataInRasaFormat(this.props.model, synonymsEnabled, intents, false, undefined, gazetteEnabled), null, 2);
        const blob = new Blob([data], { type: 'text/plain;charset=utf-8' });
        const filename = `${model.name.toLowerCase()}-${moment().toISOString()}.json`;
        saveAs(blob, filename);
        this.setState({backupDownloaded: true})
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
        return (
            <Tab.Pane>
                <br /><br />
                <Checkbox label='Export synonyms' checked={this.state.synonymsEnabled} slider
                    onChange={this.toggleSynonyms}
                />
                <br /><br /><br /><br />
                <Checkbox label='Export gazettes' checked={this.state.gazetteEnabled} slider
                    onChange={this.toggleGazetteExport}
                />
                <br /><br /><br /><br />
                <Checkbox label='Export all intents' checked={this.state.allIntents} slider
                    onChange={this.toggleIntentSelection}
                />
                {!this.state.allIntents &&
                    (
                        <div><br /><br />
                            <Dropdown
                                placeholder='Select intents to export'
                                multiple selection
                                onChange={this.handleIntentSelectorChange}
                                options={this.props.intents.map((i) => {
                                    return {text: i, value: i}
                                })}
                            />
                        </div>
                    )}
                <br /><br /><br /><br />
                <Button onClick={this.downloadModelData}><Icon name="download"/>Export Training Data</Button>
                <br />
            </Tab.Pane>
        )
    }
}

DataExport.propTypes = {
    model: PropTypes.object.isRequired,
    intents: PropTypes.array.isRequired,
}
