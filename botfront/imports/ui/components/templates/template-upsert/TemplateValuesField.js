/* eslint-disable react/prop-types */
import React, { Children } from 'react';
import PropTypes from 'prop-types';
import connectField from 'uniforms/connectField';
import joinName from 'uniforms/joinName';
import {
    Menu, Tab,
} from 'semantic-ui-react';
import { difference, cloneDeep, sortBy } from 'lodash';
import { connect } from 'react-redux';
import { languages as AllLanguages } from '../../../../lib/languages';
import { setWorkingLanguage } from '../../../store/actions/actions';

export class MultilingualTemplateField extends React.Component {
    // PROPS AVAILABLE
    //     children,
    //     className,
    //     disabled,
    //     error,
    //     errorMessage,
    //     initialCount,
    //     itemProps,
    //     label,
    //     name,
    //     required,
    //     showInlineError,
    //     value,
    //     ...props
    static isEmpty = value => !value || value.length === 0 || Object.keys(value[0]).length === 0;

    /**
     * Computes the languages that can be added to a template. E.g if project has models in 'fr', 'en', 'de' and this
     * template only has values in 'fr' then addable languages should be ['en','de']
     * @param nluLanguages languages present in NLU models
     * @param values the values field of the template
     * @returns {*}
     */
    static getAddableLanguages = (nluLanguages, values) => {
        const currentTemplateLanguages = cloneDeep(values).map(v => v.lang);
        return difference(nluLanguages, currentTemplateLanguages);
    };

    constructor(props) {
        super(props);
        const { languages: nluLanguages, value, onChange } = this.props;
        const templateValues = cloneDeep(value).concat(MultilingualTemplateField
            .getAddableLanguages(nluLanguages, value)
            .map(l => ({ sequence: [], lang: l })))
            .filter(v => v.lang);
        onChange(templateValues);
    }

    getPanes = () => {
        const {
            children, name, value,
        } = this.props;
        return sortBy(value, 'lang').map((item, index) => ({
            menuItem: <Menu.Item name={AllLanguages[item.lang].name} key={item.lang} />,
            render: () => Children.map(children, child => React.cloneElement(child, {
                // eslint-disable-next-line react/no-array-index-key
                key: index,
                label: null,
                name: joinName(name, child.props.name && child.props.name.replace('$', value.map(v => v.lang).indexOf(item.lang))),
            })),
        }));
    };

    onTabChange = (e, { activeIndex }) => {
        const { changeWorkingLanguage, languages } = this.props;
        changeWorkingLanguage(languages[activeIndex]);
    };

    render() {
        const { languages, workingLanguage } = this.props;

        return (
            <div className='bot-response-sequence'>
                <Tab
                    menu={{ pointing: true, secondary: true }}
                    panes={this.getPanes()}
                    activeIndex={languages.indexOf(workingLanguage)}
                    onTabChange={this.onTabChange}
                />
            </div>
        );
    }
}

MultilingualTemplateField.propTypes = {
    languages: PropTypes.array.isRequired,
    workingLanguage: PropTypes.string.isRequired,
    changeWorkingLanguage: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
    workingLanguage: state.settings.get('workingLanguage'),
});

const mapDispatchToProps = {
    changeWorkingLanguage: setWorkingLanguage,
};

const reduxConnected = connect(
    mapStateToProps,
    mapDispatchToProps,
)(MultilingualTemplateField);

export default connectField(reduxConnected, { ensureValue: true, includeInChain: false });
