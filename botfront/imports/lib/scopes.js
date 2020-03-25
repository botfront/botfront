/* eslint-disable import/order */
import React from 'react';

const canExport = () => true;
const checkIfCanExport = () => {};
const getUserScopesExport = () => {};
const checkIfScopeExport = () => {};
const getScopesForUserExport = () => {};
const isUserPermissionGlobalExport = () => {};
const areScopeReadyExport = () => true;
const setScopesExport = () => {};
const CanExport = props => (
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
