import { EuiBadge, EuiButton, EuiFieldText, EuiFlexGroup, EuiFlexItem } from "@elastic/eui";
import { useState } from "react";
import { useTakeActionMutation } from "./api";
import { addStory, invalidateStoryAction, RootState, } from "./store";
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

    const lastStoryType = story.length > 0 ? story[story.length - 1].type : undefined;

    const [takeAction, takeActionRes] = useTakeActionMutation();
    

    const handleTakeAction = () => {
        if (session && scenario) {
            dispatch(addStory({ text: value, type: 'ACTION' }));
            takeAction({ action: value, scenario: scenario, session: session, key: key }).unwrap()
                .then((res) => {
                    if (res.valid) {
                        const type = res.game_over ? 'LAST_OUTCOME' : 'OUTCOME';
                        dispatch(addStory({ itemChanges: res.item_changes, characterChanges: res.character_changes, vehicleChanges: res.vehicle_changes, text: res.text, type: type, gameOver: res.game_over, quote: res.quote }));
                        setValue('');
                    }
                    else {
                        dispatch(invalidateStoryAction(res.text));
                    }
                }).catch(res => {
                    console.error(res);
                    dispatch(invalidateStoryAction('Failed to take action. Try again.'));
                });
        }
    }

    const handleChangeValue = (e) => {
        const newValue: string = e.target.value;
        setValue(newValue.slice(0, 200));
    }

    const suggestionsExist = !props.disabled && suggestions.length > 0 && lastStoryType !== 'OUTCOME';

    return <EuiFlexGroup direction='column' gutterSize='s'>
        {suggestionsExist &&
            <EuiFlexItem>
                <EuiFlexGroup gutterSize='s' alignItems='baseline' wrap responsive={false}>
                    {suggestions.map(sug => value !== sug &&
                        <EuiFlexItem key={sug} grow={false}>
                            <EuiBadge className='suggestion-badge' color='default' onClick={() => setValue(sug)} onClickAriaLabel='select suggestion' isDisabled={props.disabled || takeActionRes.isLoading} >
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