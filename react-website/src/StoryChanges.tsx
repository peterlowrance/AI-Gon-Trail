import { EuiBadge, EuiFlexGroup, EuiFlexItem } from "@elastic/eui";
import { ChangesType } from "./api";
import Item from "./Item";

function StoryChanges(props: { type: 'Character' | 'Item' | 'Vehicle', changes: ChangesType }) {

    const getPluralS = (list: string[]) => list.length > 1 ? 's' : '';

    // Try to parse the health out of the 'changed'
    let healthLost = undefined as undefined | number;
    try {
        if (props.changes.changed) {
            const values = Object.values(props.changes.changed);
            if (values.length === 1 && values[0].added.length === 1 && values[0].removed.length === 1 &&
                values[0].added[0].toLowerCase().includes('health') && values[0].removed[0].toLowerCase().includes('health')) {
                const oldVal = values[0].removed[0];
                const newVal = values[0].added[0];
                const oldHealth = parseInt(oldVal.match(/(\d+)\/\d+/)[1]);
                const newHealth = parseInt(newVal.match(/(\d+)\/\d+/)[1]);
                healthLost = oldHealth - newHealth;
            }
        }
    }
    catch { }

    return <>
        {props.changes.added.length > 0 &&
            <>
                <p><b>New {props.type}{getPluralS(props.changes.added)}:</b></p>
                <EuiFlexGroup responsive={false} gutterSize='s' wrap>
                    {props.changes.added.map(char =>
                        <EuiFlexItem grow={false} key={char}>
                            <Item value={char} />
                        </EuiFlexItem>
                    )}
                </EuiFlexGroup>
            </>
        }
        {props.changes.removed.length > 0 &&
            <>
                <p><b>{props.type === 'Character' ? 'Deceased' : 'Lost'} {props.type}{getPluralS(props.changes.removed)}:</b></p>
                <EuiFlexGroup responsive={false} gutterSize='s' wrap>
                    {props.changes.removed.map(char =>
                        <EuiFlexItem grow={false} key={char}>
                            <Item value={char} />
                        </EuiFlexItem>
                    )}
                </EuiFlexGroup>
            </>
        }
        {props.changes.changed && Object.keys(props.changes.changed).length > 0 && (healthLost ?
            <p><b>{Object.keys(props.changes.changed)[0]} {healthLost > 0 ? 'lost' : 'gained'} {healthLost} health</b></p>
            :
            <>
                <p><b>Changed {props.type}{getPluralS(props.changes.removed)}:</b></p>
                {Object.entries(props.changes.changed).map(([char, obj], i) =>
                    <EuiFlexGroup key={i} responsive={false} gutterSize='s' wrap alignItems='center' style={{ marginBottom: 4 }}>
                        <EuiFlexItem grow={false}><Item value={char} /></EuiFlexItem>
                        {obj.removed.length > 0 &&
                            <>
                                <EuiFlexItem grow={false}> is no longer </EuiFlexItem>
                                {obj.removed.map(r => <EuiFlexItem key={r} grow={false}><EuiBadge color='success'>{r}</EuiBadge></EuiFlexItem>)}
                            </>
                        }
                        {obj.added.length > 0 &&
                            <>
                                <EuiFlexItem grow={false}>{obj.removed.length > 0 ? ' and is now ' : ' is now '}</EuiFlexItem>
                                {obj.added.map(r => <EuiFlexItem key={r} grow={false}><EuiBadge color='success'>{r}</EuiBadge></EuiFlexItem>)}
                            </>
                        }
                    </EuiFlexGroup>
                )}
            </>
        )}
    </>;
}

export default StoryChanges;