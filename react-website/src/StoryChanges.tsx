import { EuiFlexGroup, EuiFlexItem } from "@elastic/eui";
import { ChangesType } from "./api";
import Item from "./Item";

function StoryChanges(props: { type: 'Character' | 'Item', changes: ChangesType }) {

    const getPluralS = (list: string[]) => list.length > 1 ? 's' : '';

    return <>
        {props.changes.added.length > 0 &&
            <>
                <p><b>New {props.type}{getPluralS(props.changes.added)}:</b></p>
                <EuiFlexGroup responsive={false} gutterSize='s' wrap>
                    {props.changes.added.map(char =>
                        <EuiFlexItem grow={false}>
                            <Item value={char} key={char} />
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
                        <EuiFlexItem grow={false}>
                            <Item value={char} key={char} />
                        </EuiFlexItem>
                    )}
                </EuiFlexGroup>
            </>
        }
        {props.changes.changed && Object.keys(props.changes.changed).length > 0 &&
            <>
                <p><b>Changed {props.type}{getPluralS(props.changes.removed)}:</b></p>
                {Object.entries(props.changes.changed).map(([char, obj]) =>
                    <p>{char}
                        {obj.removed.length > 0 && ` is no longer ${obj.removed.join(', ')}`}
                        {obj.removed.length > 0 && obj.added.length > 0 && ' and'}
                        {obj.added.length > 0 && ` is now ${obj.added.join(', ')}`}
                    </p>
                )}
            </>
        }
    </>;
}

export default StoryChanges;