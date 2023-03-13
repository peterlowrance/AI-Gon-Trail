import { EuiBadge, EuiCard, EuiPanel } from "@elastic/eui";
import { useEffect, useState } from "react";
import _ from 'lodash';

const regExp = /\(([^)]+)\)/g; // matches anything between parentheses

export const parseText = (value) => {
    const parenContents = value.match(regExp);
    let text = value;
    parenContents?.forEach(content => {
        // Remove parenthetical phrase
        text = text.replace(content, '');
    });
    return text;
}

const parseAttributes = (value) => {
    const attributes = [];
    const parenContents = value.match(regExp);
    parenContents?.forEach(content => {
        // Remove ( and ) from attributeQ
        const parsedContent = content.replaceAll('(', '').replaceAll(')', '');
        // Add all comma separated attributes
        parsedContent.split(',').forEach(val => attributes.push(val.trim()));
    });
    return attributes;
}

export default function Item(props: { value: string, cost?: number }) {
    const [text, setText] = useState(parseText(props.value));
    const [attributes, setAttributes] = useState<string[]>(parseAttributes(props.value));
    const [addedAttributes, setAddedAttributes] = useState<string[]>([]);
    const [removedAttributes, setRemovedAttributes] = useState<string[]>([]);

    useEffect(() => {
        const newAttributes = parseAttributes(props.value);
        const newText = parseText(props.value);

        if (newText !== text) {
            setText(newText);
        }
        if (_.isEqual(attributes, newAttributes)) {
            console.log(attributes, newAttributes)
            const removed = _.difference(attributes, newAttributes);
            const added = _.difference(newAttributes, attributes);
            console.log('Removed attributes', removed, 'from', newText);
            console.log('Added attributes', added, 'from', newText);
            setAddedAttributes(added);
            setRemovedAttributes(removed);
            setAttributes(newAttributes);
            setTimeout(() => {
                setAddedAttributes([]);
                setRemovedAttributes([]);
            }, 5000);
        }
    }, [props.value]);


    return <EuiPanel
        onClick={props.onClick}
        paddingSize='s'
        hasBorder
        hasShadow
        color={props.selected ? 'primary' : 'subdued'}
        style={{ width: 'max-content', border: '1px solid lightblue', backgroundColor: props.selected ? 'lightblue' : undefined }}
    >
        <strong>{text}</strong>
        &nbsp;
        {attributes.map(at =>
            <EuiBadge color={addedAttributes.includes(at) ? 'success' : (removedAttributes.includes(at) ? 'danger' : undefined)}>
                {at}
            </EuiBadge>
        )}
        {props.cost && <EuiBadge color='warning'>${props.cost}</EuiBadge>}
    </EuiPanel>
}