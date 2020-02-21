/* eslint-disable import/order */
// import { Projects } from '../api/project/project.collection';
import React from 'react';

let canExport = () => true;
let checkIfCanExport = () => {};
let getScopesForUserExport = () => {};
let areScopeReadyExport = () => true;
let setScopesExport = () => {};
let CanExport = props => (
    <>
        {props.children}
    </>
);

// ee start
// eslint-disable-next-line import/first
import { can as canEE, checkIfCan as checkIfCanEE } from '../api/roles/roles';
// eslint-disable-next-line import/first
import { Roles } from 'meteor/alanning:roles';
// eslint-disable-next-line import/first
import { connect } from 'react-redux';
// eslint-disable-next-line import/first
import { Children } from 'react';


canExport = canEE;
checkIfCanExport = checkIfCanEE;
getScopesForUserExport = (userId, permission) => Roles.getScopesForUser(userId, permission);
areScopeReadyExport = () => Roles.subscription.ready();
setScopesExport = (user, userId) => {
    Roles.setUserRoles(userId, [], { anyScope: true });
    user.roles.forEach((role) => {
        const project = role.project === 'GLOBAL' ? null : role.project;
        Roles.setUserRoles(userId, role.roles, project);
    });
};
CanExport = ({ children, I, projectId }) => (canExport(I, projectId) ? Children.only(children) : null);

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
});

CanExport = connect(
    mapStateToProps,
)(CanExport);
// ee end


export const getScopesForUser = getScopesForUserExport;
export const can = canExport;
export const checkIfCan = checkIfCanExport;
export const areScopeReady = areScopeReadyExport;
export const setScopes = setScopesExport;
export const Can = CanExport;
