import { Children } from 'react';
import { connect } from 'react-redux';
import { can } from '../../../lib/scopes';

const Can = ({ children, I, projectId }) => (can(I, projectId) ? Children.only(children) : null);

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
});

export default connect(
    mapStateToProps,
)(Can);
