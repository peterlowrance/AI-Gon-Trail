import { EuiBadge, EuiPanel } from "@elastic/eui";
import _ from 'lodash';

const regExp = /\(([^)]+)\)/g; // matches anything between parentheses

const parseKey = (value) => {
    const parenContents = value.match(regExp);
    let key = value;
    parenContents?.forEach(content => {
        // Remove parenthetical phrase
        key = key.replace(content, '');
    });
    return key.trim();
}

const parseAttributes = (value) => {
    const attributes = [] as string[];
    const parenContents = value.match(regExp);
    parenContents?.forEach(content => {
        // Remove ( and ) from attributeQ
        const parsedContent = content.replaceAll('(', '').replaceAll(')', '');
        // Add all comma separated attributes
        parsedContent.split(',').forEach(val => attributes.push(val.trim()));
    });
    return attributes;
}

export default function Item(props: { value: string, cost?: number, selected?: boolean, onClick?: any }) {

    return <EuiPanel
        onClick={props.onClick}
        paddingSize='s'
        hasBorder
        hasShadow
        color={props.selected ? 'primary' : 'subdued'}
        style={{ width: 'max-content', border: '1px solid lightblue', backgroundColor: props.selected ? 'lightblue' : undefined, maxHeight: 38 }}
    >
        <strong>{parseKey(props.value)}</strong>
        &nbsp;
        {parseAttributes(props.value).map((at, i) =>
            <EuiBadge color='success' key={i}>
                {at}
            </EuiBadge>
        )}
        {props.cost && <EuiBadge color='warning'>${props.cost}</EuiBadge>}
    </EuiPanel>
}