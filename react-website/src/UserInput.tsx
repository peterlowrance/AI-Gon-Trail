import { EuiBadge, EuiButton, EuiFieldText, EuiFlexGroup, EuiFlexItem, EuiText } from "@elastic/eui";
import { useState } from "react";
import { useTakeActionMutation } from "./api";
import { RootState } from "./store";
import { useSelector } from 'react-redux';

export default function UserInput(props: { disabled: boolean, suggestions: string[] }) {
    const [value, setValue] = useState('');
    const session = useSelector((state: RootState) => state.game.session);

    const [takeAction] = useTakeActionMutation();

    const handleTakeAction = () => {
        if (session)
            takeAction({ action: value, session: session }).unwrap()
                .then(() => {
                    setValue('');
                });
    }

    const handleChangeValue = (e) => {
        const newValue: string = e.target.value;
        setValue(newValue.slice(0, 100));
    }

    return <EuiFlexGroup direction='column' gutterSize='s'>
        {!props.disabled &&
            <EuiFlexItem>
                <EuiFlexGroup gutterSize='s' alignItems='baseline'>
                    <EuiFlexItem grow={false}>
                        <EuiText>
                            Suggestions:
                        </EuiText>
                    </EuiFlexItem>
                    {props.suggestions.map(sug =>
                        <EuiFlexItem key={sug} grow={false}>
                            <EuiBadge color='default' onClick={() => setValue(sug)}>
                                {sug}
                            </EuiBadge>
                        </EuiFlexItem>
                    )}
                </EuiFlexGroup>
            </EuiFlexItem>
        }
        <EuiFlexItem>
            <EuiFlexGroup gutterSize='s'>
                <EuiFlexItem>
                    <EuiFieldText
                        placeholder="Action..."
                        value={value}
                        onChange={handleChangeValue}
                        disabled={props.disabled}
                        // resize='none'
                        fullWidth
                    />
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                    <EuiButton isDisabled={!value || props.disabled} onClick={handleTakeAction}>Take Action</EuiButton>
                </EuiFlexItem>
            </EuiFlexGroup>
        </EuiFlexItem>
    </EuiFlexGroup>
}