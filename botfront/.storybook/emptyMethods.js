/* eslint-disable import/order */
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

export const getScopesForUser = getScopesForUserExport;
export const can = canExport;
export const checkIfCan = checkIfCanExport;
export const areScopeReady = areScopeReadyExport;
export const setScopes = setScopesExport;
export const Can = CanExport;
export const Meteor = {
    call: () => {},
    subscribe: () => {},
};
export const stringPayloadToObject = () => ({ intent: true });