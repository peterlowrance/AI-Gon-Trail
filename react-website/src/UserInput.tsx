import { EuiBadge, EuiButton, EuiFieldText, EuiFlexGroup, EuiFlexItem, EuiText } from "@elastic/eui";
import { useState } from "react";
import { useTakeActionMutation } from "./api";
import { addStory, RootState } from "./store";
import { useSelector, useDispatch } from 'react-redux';

export default function UserInput(props: { disabled: boolean }) {
    const dispatch = useDispatch();
    const [value, setValue] = useState('');
    const session = useSelector((state: RootState) => state.game.session);
    const suggestions = useSelector((state: RootState) => state.game.suggestions);
    const story = useSelector((state: RootState) => state.game.story);
    
    let scenario = null as null | string;
    if (story.length > 0){
        const lastStory = story[story.length - 1];
        if (lastStory.type === 'SCENARIO') {
            scenario = lastStory.text;
        }
    }

    const [takeAction] = useTakeActionMutation();

    const handleTakeAction = () => {
        if (session && scenario) {
            // TODO: validate action
            dispatch(addStory({text: value, type: 'ACTION'}));
            takeAction({ action: value, scenario: scenario, session: session }).unwrap()
                .then((res) => {
                    setValue('');
                    dispatch(addStory({text: res, type: 'OUTCOME'}))
                });
        }
    }

    const handleChangeValue = (e) => {
        const newValue: string = e.target.value;
        setValue(newValue.slice(0, 100));
    }

    return <EuiFlexGroup direction='column' gutterSize='s'>
        {!props.disabled && suggestions.length > 0 &&
            <EuiFlexItem>
                <EuiFlexGroup gutterSize='s' alignItems='baseline' wrap>
                    <EuiFlexItem grow={false}>
                        <EuiText>
                            Suggestions:
                        </EuiText>
                    </EuiFlexItem>
                    {suggestions.map(sug => value !== sug &&
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
                        disabled={props.disabled || !scenario}
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