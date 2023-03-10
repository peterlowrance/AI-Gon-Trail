import { EuiBadge, EuiCard, EuiPanel } from "@elastic/eui";

const regExp = /\(([^)]+)\)/g; // matches anything between parentheses

export default function Item(props) {
    const attributes = [];
    let displayValue = props.value;

    const parenContents = props.value.match(regExp);
    parenContents?.forEach(content => {
        // Remove parenthetical phrase
        displayValue = displayValue.replace(content, '');
        // Remove ( and ) from attribute
        const parsedContent = content.replaceAll('(', '').replaceAll(')', '')
        // Add all comma separated attributes
        parsedContent.split(',').forEach(val => attributes.push(val.trim()))
    })

    return <EuiPanel
        onClick={props.onClick}
        paddingSize='s'
        hasBorder
        hasShadow
        color={props.selected ? 'primary' : 'subdued'}
        style={{ width: 'max-content', border: '1px solid lightblue', backgroundColor: props.selected ? 'lightblue' : undefined }}
    >
        <strong>{displayValue}</strong>
        &nbsp;
        {attributes.length > 0 &&
            <EuiBadge>{attributes}</EuiBadge>
        }
        {props.cost && <EuiBadge  color='warning'>${props.cost}</EuiBadge>}
    </EuiPanel>
}