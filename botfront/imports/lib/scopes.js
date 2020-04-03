/* eslint-disable import/order */
/* eslint-disable prefer-const */
import React from 'react';

let canExport = () => true;
let checkIfCanExport = () => {};
let getUserScopesExport = () => {};
let checkIfScopeExport = () => {};
let getScopesForUserExport = () => {};
let isUserPermissionGlobalExport = () => {};
let areScopeReadyExport = () => true;
let setScopesExport = () => {};
let CanExport = props => (
    <>
        {props.children}
    </>
);


export const getUserScopes = getUserScopesExport;
export const checkIfScope = checkIfScopeExport;
export const isUserPermissionGlobal = isUserPermissionGlobalExport;
export const getScopesForUser = getScopesForUserExport;
export const can = canExport;
export const checkIfCan = checkIfCanExport;
export const areScopeReady = areScopeReadyExport;
export const setScopes = setScopesExport;
export const Can = CanExport;
