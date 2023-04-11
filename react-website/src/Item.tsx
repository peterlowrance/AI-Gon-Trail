import { EuiBadge, EuiPanel } from "@elastic/eui";
import _ from 'lodash';
import { parseAttributes, parseKey } from "./ItemPanel";

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