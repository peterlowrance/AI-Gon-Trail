import { EuiFlexGroup, EuiFlexItem, EuiPanel, EuiTitle } from "@elastic/eui";
import Item from "./Item";
import _ from 'lodash';

function ItemPanel(props: { items: string[], title: string }) {

    const mobile = window.innerWidth <= 800;

    return <EuiPanel paddingSize={mobile ? 's' : 'm'} hasShadow={false} hasBorder>
        <EuiTitle size='xs'>
            <h3>{props.title}:</h3>
        </EuiTitle>
        <EuiFlexGroup gutterSize='xs' responsive={false} wrap={mobile} direction={mobile ? 'row' : 'column'} style={{overflowY: 'scroll'}}>
            {props.items.map(item =>
                <EuiFlexItem grow={false} key={item}>
                    <Item value={item} />
                </EuiFlexItem>
            )}
        </EuiFlexGroup>
    </EuiPanel>;
}

export default ItemPanel;