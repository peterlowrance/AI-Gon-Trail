import { EuiFlexGroup, EuiFlexItem, EuiPanel, EuiSpacer, EuiTitle } from "@elastic/eui";
import { Fragment, useEffect, useRef } from "react";
import { useDispatch } from 'react-redux';
import Item from "./Item";
import _ from 'lodash';
import { addToast } from "./store";

const regExp = /\(([^)]+)\)/g; // matches anything between parentheses

export const parseKey = (value) => {
    const parenContents = value.match(regExp);
    let key = value;
    parenContents?.forEach(content => {
        // Remove parenthetical phrase
        key = key.replace(content, '');
    });
    return key.trim();
}

export const parseAttributes = (value) => {
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

function ItemPanel(props: { items: string[], title: string }) {
    const dispatch = useDispatch();
    const prevItems = useRef<null | string[]>(null);

    const mobile = window.innerWidth <= 800;

    useEffect(() => {
        if (prevItems.current) {
            const newItems = [] as string[];
            const removedItems = [] as string[];
            const changedAttrItems = {} as { [key: string]: { prevAttr: string[], newAttr: string[] } };

            const itemToObj = {};
            props.items.forEach(newItem => {
                const newKey = parseKey(newItem);
                const newAttr = parseAttributes(newItem);
                itemToObj[newKey] = { newAttr: newAttr };
            });
            const prevKeySet = new Set<string>();
            prevItems.current.forEach(prevItem => {
                const prevKey = parseKey(prevItem);
                prevKeySet.add(prevKey);
                if (prevKey in itemToObj) {
                    const newAttr = itemToObj[prevKey].newAttr;
                    const prevAttr = parseAttributes(prevItem);
                    // If attrs changed
                    if (!_.isEqual(newAttr, prevAttr)) {
                        changedAttrItems[prevKey] = { prevAttr, newAttr };
                    }
                }
                else {
                    removedItems.push(prevItem);
                }
            });
            props.items.forEach(newItem => {
                const newKey = parseKey(newItem);
                if (!prevKeySet.has(newKey)) {
                    newItems.push(newItem);
                }
            });

            // Send notifications
            if (newItems.length > 0) {
                const content = newItems.map(i => <Item value={i} />);
                dispatch(addToast({ title: 'New ' + props.title.toLowerCase(), text: content, color: 'success' }));
            }
            if (removedItems.length > 0) {
                const content = removedItems.map(i => <Item value={i} />);
                dispatch(addToast({ title: props.title + ' lost', text: content, color: 'danger' }));
            }
            if (Object.keys(changedAttrItems).length > 0) {
                const content = <>
                    {Object.entries(changedAttrItems).map(([key, obj]) =>
                        <p>
                            <Item value={`(${obj.prevAttr.join(',')}) ${key}`} />
                            &rarr;
                            <Item value={`(${obj.newAttr.join(',')}) ${key}`} />
                        </p>
                    )}
                </>;
                dispatch(addToast({ title: 'Changed ' + props.title.toLowerCase(), text: content }));
            }
        }
        prevItems.current = props.items;
    }, [props.items]);

    return <EuiPanel paddingSize={mobile ? 's' : 'm'} hasShadow={false} hasBorder>
        <EuiTitle size='xs'>
            <h3>{props.title}:</h3>
        </EuiTitle>
        <EuiFlexGroup gutterSize='xs' responsive={false} wrap={mobile} direction={mobile ? 'row' : 'column'} style={{overflowY: 'scroll'}}>
            {props.items.map(item =>
                <EuiFlexItem grow={false}>
                    <Item value={item} />
                </EuiFlexItem>
            )}
        </EuiFlexGroup>
    </EuiPanel>;
}

export default ItemPanel;