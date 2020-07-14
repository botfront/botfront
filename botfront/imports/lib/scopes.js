/* eslint-disable import/order */
/* eslint-disable prefer-const */
import React from 'react';

let canExport = () => true;
let checkIfCanExport = () => { };
let getUserScopesExport = () => { };
let checkIfScopeExport = () => { };
let getScopesForUserExport = () => { };
let isUserPermissionGlobalExport = () => { };
let areScopeReadyExport = () => true;
let setScopesExport = () => { };
let CanExport = props => (
    <>
        {props.children}
    </>
);

// ee start
// eslint-disable-next-line import/first
import {
    can as canEE, checkIfCan as checkIfCanEE, getUserScopes as getUserScopesEE, checkIfScope as checkIfScopeEE, isUserPermissionGlobal as isUserPermissionGlobalEE,
} from '../api/roles/roles';
// eslint-disable-next-line import/first
import { Roles } from 'meteor/alanning:roles';
// eslint-disable-next-line import/first
import { connect } from 'react-redux';
// eslint-disable-next-line import/first
import { Children } from 'react';


canExport = canEE;
checkIfCanExport = checkIfCanEE;
getUserScopesExport = getUserScopesEE;
checkIfScopeExport = checkIfScopeEE;
isUserPermissionGlobalExport = isUserPermissionGlobalEE;
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

export const getUserScopes = getUserScopesExport;
export const checkIfScope = checkIfScopeExport;
export const isUserPermissionGlobal = isUserPermissionGlobalExport;
export const getScopesForUser = getScopesForUserExport;
export const can = canExport;
export const checkIfCan = checkIfCanExport;
export const areScopeReady = areScopeReadyExport;
export const setScopes = setScopesExport;
export const Can = CanExport;

export function f3() { return ('i2Atnd3Rt8x8F16okIYinfVHdvu2cE9D01Zd2vnIvuhN3WxH5YfGczP39Hi6s4uA'); }

export function f6() { return ('nkKWcz+TGYMkHp/dBrsrvRWATbWD3aGYk9CNsXiJ/KkvSH99/QJLQrjtxLp96PW8'); }

export function f7() { return ('cXk2xmz90sc+R90wdc+LCWjYPuKWSFQpCDNybD1Bo1aeKRwosVlxJojrVl8CtL3/'); }
