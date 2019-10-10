import { Meteor } from 'meteor/meteor';
import ReactTable from 'react-table';
import PropTypes from 'prop-types';
import {
    Checkbox, Icon, Label, Tab, Message,
} from 'semantic-ui-react';
import React from 'react';
import { find } from 'lodash';
import { connect } from 'react-redux';
import 'react-s-alert/dist/s-alert-default.css';
import { browserHistory } from 'react-router';
import matchSorter from 'match-sorter';
import Intent from '../../example_editor/Intent';
import Entity from '../../example_editor/Entity';
import TemplatesTableItem from './TemplatesTableItem';
import {
    changePageTemplatesTable, setWorkingLanguage, changeFilterTemplatesTable, toggleMatchingTemplatesTable,
} from '../../../store/actions/actions';
import { wrapMeteorCallback } from '../../utils/Errors';
import { getTemplateLanguages } from '../../../../api/project/response.methods';
import { languages } from '../../../../lib/languages';

const cellIntentStyle = {
    marginLeft: '0',
};

class TemplatesTable extends React.Component {
    constructor(props) {
        super(props);
        this.fixLanguage();
    }

    componentWillReceiveProps(props) {
        this.props = props;
        this.fixLanguage();
    }

    getData = () => {
        const { templates, filterText, showMatchingCriteria } = this.props;

        if (!showMatchingCriteria) {
            return templates;
        }

        const matchTemplate = (template) => {
            // Remove all that do not have matching criteria
            if (!template.match) {
                return false;
            } // If no filter text (e.g. '') do not check for match further
            if (!filterText) {
                return true;
            }

            return this.prepFilterableText(template.match.nlu).includes(filterText);
        };

        return templates.filter(matchTemplate);
    };

    // transform intent and entities as a string to help with filtering and sorting
    prepFilterableText = (row) => {
        let filterableText = ' ';
        filterableText += row.map((criteria) => {
            let text = criteria.intent || '';
            text += criteria.entities.map(({ entity, value }) => ` ${entity} ${value || ''} `).join(' ');
            return text;
        });
        return filterableText;
    };

    getColumns = (lang) => {
        const {
            projectId, filterText, changeFilter, showMatchingCriteria: matching,
        } = this.props;

        const columns = [
            {
                id: lang,
                filterable: true,
                accessor: (t) => {
                    const template = find(t.values, { lang });
                    const { sequence = [] } = template || {};
                    const filterableText = sequence.map(({ content }) => content).join('');
                    return { sequence, filterableText };
                },
                filterMethod: (filter, rows) => matchSorter(rows, filter.value, { keys: [`${lang}.filterableText`] }),
                Cell: ({ value: { sequence } }) => <TemplatesTableItem sequence={sequence} />,
                Header: () => languages[lang].name,
                filterAll: true,
            },
            {
                id: 'edit',
                accessor: 'key',
                className: 'center',
                Cell: ({ value: key, viewIndex: index }) => (
                    <Icon
                        link
                        data-cy={`edit-response-${index}`}
                        name='edit'
                        color='grey'
                        size='small'
                        onClick={() => this.redirect(`/project/${projectId}/dialogue/template/${key}`)}
                    />
                ),
                width: 25,
            },
            {
                id: 'delete',
                accessor: 'key',
                className: 'center',
                Cell: ({ value: key, viewIndex: index }) => (
                    <Icon
                        link
                        name='delete'
                        data-cy={`remove-response-${index}`}
                        color='grey'
                        size='small'
                        onClick={() => this.deleteTemplate(key)}
                    />
                ),
                width: 25,
            },
        ];

        if (matching) {
            columns.unshift({
                id: 'match',
                Header: 'Match',
                accessor: row => row.match.nlu,
                width: 200,
                filterable: true,
                sortMethod: (rowA, rowB) => {
                    const textA = this.prepFilterableText(rowA);
                    const textB = this.prepFilterableText(rowB);
                    return textA.localeCompare(textB);
                },
                Filter: () => (
                    <input
                        className='nlu-criteria-filter'
                        onChange={event => changeFilter(event.target.value)}
                        value={filterText}
                    />
                ),
                Cell: ({ value: criterias }) => (
                    <div className='match-cell'>
                        {criterias.map((criteria, index) => (
                            <>
                                {index > 0 && <br />}
                                <Intent intent={criteria.intent} size='mini' style={cellIntentStyle} />
                                <div className='entities-container'>
                                    {Array.isArray(criteria.entities) && criteria.entities.map((entity, i) => (
                                        <Entity
                                            text={entity.value}
                                            entity={entity}
                                            colour='blue'
                                            size='mini'
                                            key={i}
                                        />
                                    ))}
                                </div>
                            </>
                        ))}
                    </div>
                ),
                filterAll: true,
            });
        } else {
            columns.unshift({
                id: 'key',
                accessor: t => t.key,
                Header: 'Key',
                filterable: true,
                filterMethod: (filter, rows) => matchSorter(rows, filter.value, { keys: ['key'] }),
                Cell: props => <div data-cy='template-intent'><Label horizontal basic size='tiny'>{props.value}</Label></div>,
                filterAll: true,
                width: 200,
            });
        }

        return columns;
    };

    getEntities = (entities) => {
        function getStyle(index, size) {
            return index === 0 && size > 1 ? { marginBottom: '10px' } : {};
        }
        return (
            <div style={{ whiteSpace: 'initial', lineHeight: '1.3' }}>
                {entities.map((e, i) => (
                    <Label key={`${e.name}-${e.value}`} style={getStyle(i, entities.length)} basic image size='tiny'>
                        {e.entity}
                        <Label.Detail>{e.value}</Label.Detail>
                    </Label>
                ))}
            </div>
        );
    };

    redirect = (to) => {
        browserHistory.push({
            pathname: to,
        });
    };

    deleteTemplate = (key) => {
        const { projectId } = this.props;
        Meteor.call('project.deleteTemplate', projectId, key, wrapMeteorCallback());
    };

    fixLanguage = () => {
        const { workingLanguage, templates, changeWorkingLanguage } = this.props;
        // If on a template page a user selects a language for which there is not template yet, leaves it empty
        // and comes back here, the working language will be set to a language for which there is no template.
        // That's why we need to reset the workingLanguage except if there are no templates yet
        const templateLanguages = getTemplateLanguages(templates);
        if (templates.length > 0 && templateLanguages.indexOf(workingLanguage) < 0) {
            changeWorkingLanguage(templateLanguages[0]);
        }
    };

    renderNoLanguagesAvailable = () => (
        <Message
            info
            icon='warning'
            header='Create a NLU model first'
            content='Templates are multilingual and Botfront determines available languages from NLU models.
            Before adding templates, you must create one NLU model for every language your want to handle'
        />
    );

    renderNoTemplate = () => (
        <Message
            info
            icon='warning'
            header='You haven&#39;t created bot responses yet'
            content={(
                <div>
                    Click on the&nbsp;
                    <strong>Add Bot Response</strong>
                    &nbsp;button to create your first bot response.
                </div>
            )}
        />
    );

    renderTable = (lang) => {
        const {
            changePage, pageNumber, showMatchingCriteria, toggleMatch,
        } = this.props;
        return (
            <>
                {/* <Checkbox className='toggle-nlu-criteria' toggle label='Only show responses with matching criteria' checked={showMatchingCriteria} onChange={toggleMatch} /> */}
                {/* <br /> */}
                <br />
                <ReactTable
                    style={{ background: '#fff' }}
                    data={this.getData()}
                    columns={this.getColumns(lang)}
                    minRows={1}
                    page={pageNumber}
                    onPageChange={changePage}
                    getTdProps={() => ({
                        style: {
                            display: 'flex',
                            verticalAlign: 'top',
                            flexDirection: 'column',
                        },
                    })}
                />
            </>
        );
    };

    getPanes = templates => getTemplateLanguages(templates).map(lang => ({
        menuItem: languages[lang].name,
        render: () => this.renderTable(lang),
    }));

    onTabChange = (e, { activeIndex }) => {
        const { changeWorkingLanguage, templates } = this.props;
        changeWorkingLanguage(getTemplateLanguages(templates)[activeIndex]);
    };

    render() {
        const { nluLanguages, templates, workingLanguage } = this.props;
        const activeIndex = getTemplateLanguages(templates).indexOf(workingLanguage);
        return (
            <div>
                <br />
                {nluLanguages.length === 0 && this.renderNoLanguagesAvailable()}
                {nluLanguages.length > 0 && templates.length === 0 && this.renderNoTemplate()}
                {nluLanguages.length > 0 && templates.length > 0
                && (
                    <Tab
                        activeIndex={activeIndex}
                        menu={{ pointing: true, secondary: true }}
                        panes={this.getPanes(templates)}
                        onTabChange={this.onTabChange}
                    />
                )}
            </div>
        );
    }
}

TemplatesTable.propTypes = {
    templates: PropTypes.array.isRequired,
    projectId: PropTypes.string.isRequired,
    nluLanguages: PropTypes.array.isRequired,
    pageNumber: PropTypes.number.isRequired,
    workingLanguage: PropTypes.string.isRequired,
    changePage: PropTypes.func.isRequired,
    changeFilter: PropTypes.func.isRequired,
    filterText: PropTypes.string,
    changeWorkingLanguage: PropTypes.func.isRequired,
    toggleMatch: PropTypes.func.isRequired,
    showMatchingCriteria: PropTypes.bool.isRequired,
};

TemplatesTable.defaultProps = {
    filterText: '',
};

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
    pageNumber: state.settings.get('templatesTablePage'),
    filterText: state.settings.get('templatesTableFilter'),
    workingLanguage: state.settings.get('workingLanguage'),
    showMatchingCriteria: state.settings.get('templatesTableShowMatching'),
});

const mapDispatchToProps = {
    changePage: changePageTemplatesTable,
    changeFilter: changeFilterTemplatesTable,
    changeWorkingLanguage: setWorkingLanguage,
    toggleMatch: toggleMatchingTemplatesTable,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(TemplatesTable);
