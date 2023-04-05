import { EuiBadge, EuiButton, EuiFieldText, EuiFlexGroup, EuiFlexItem, EuiText } from "@elastic/eui";
import { useState } from "react";
import { useTakeActionMutation } from "./api";
import { addStory, invalidateStoryAction, RootState, setWin } from "./store";
import { useSelector, useDispatch } from 'react-redux';
import _ from 'lodash';

export default function UserInput(props: { disabled: boolean }) {
    const dispatch = useDispatch();
    const [value, setValue] = useState('');
    const session = useSelector((state: RootState) => state.game.session);
    const suggestions = useSelector((state: RootState) => state.game.suggestions);
    const story = useSelector((state: RootState) => state.game.story);
    const key = useSelector((state: RootState) => state.game.key);

    let scenario = undefined as undefined | string;
    if (story.length > 0) {
        scenario = _.findLast(story, s => s.type === 'SCENARIO')?.text;
    }

    const [takeAction, takeActionRes] = useTakeActionMutation();

    const handleTakeAction = () => {
        if (session && scenario) {
            dispatch(addStory({ text: value, type: 'ACTION' }));
            takeAction({ action: value, scenario: scenario, session: session, key: key }).unwrap()
                .then((res) => {
                    if (res.valid) {
                        dispatch(addStory({ text: res.text, type: 'OUTCOME' }));
                        setValue('');
                        if (res.win) {
                            dispatch(setWin(true));
                        }
                    }
                    else {
                        dispatch(invalidateStoryAction(res.text));
                    }
                }).catch(res => {
                    console.error(res);
                    alert('Failed to take action');
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
                <EuiFlexGroup gutterSize='s' alignItems='baseline' wrap responsive={false}>
                    {suggestions.map(sug => value !== sug &&
                        <EuiFlexItem key={sug} grow={false}>
                            <EuiBadge color='default' onClick={() => setValue(sug)} isDisabled={props.disabled || takeActionRes.isLoading}>
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
                        onKeyDown={e => e.code === 'Enter' && handleTakeAction()}
                        disabled={props.disabled || !scenario}
                        fullWidth
                    />
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                    <EuiButton color='primary' isLoading={takeActionRes.isLoading} isDisabled={!value || props.disabled} onClick={handleTakeAction}>Take Action</EuiButton>
                </EuiFlexItem>
            </EuiFlexGroup>
        </EuiFlexItem>
    </EuiFlexGroup>
}