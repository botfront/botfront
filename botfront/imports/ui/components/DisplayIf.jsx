import BaseField from 'uniforms/BaseField';
import nothing from 'uniforms/nothing';
import { Children } from 'react';

// We have to ensure that there's only one child, because returning an array
// from a component is prohibited.
const DisplayIf = ({ children, condition }, { uniforms }) => (condition(uniforms) ? Children.only(children) : nothing);
DisplayIf.contextTypes = BaseField.contextTypes;


export default DisplayIf;
