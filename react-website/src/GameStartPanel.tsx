import { EuiButton, EuiFieldText, EuiFlexGroup, EuiFlexItem, EuiFormRow, EuiPanel, EuiText, EuiTitle } from "@elastic/eui";
import { RootState, setKey, setTheme } from "./store";
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from "react";

function GameStartPanel(props: { handleStart: Function, loading: boolean, error: boolean }) {
    const dispatch = useDispatch();
    const key = useSelector((state: RootState) => state.game.key);
    const theme = useSelector((state: RootState) => state.game.theme);

    useEffect(() => {
        dispatch(setKey('access'));
    }, []);

    return <EuiPanel hasBorder className='info-panel-apper'>
        <EuiFlexGroup direction='column'>
            <EuiFlexItem><EuiTitle><h1>Welcome to AI-Gon Trail</h1></EuiTitle></EuiFlexItem>
            {/* <EuiFlexItem>
                <EuiFormRow label='Enter your OpenAI key' helpText='Go to openai.com to get an api key'>
                    <EuiFieldText value={key} onChange={e => dispatch(setKey(e.target.value))} />
                </EuiFormRow>
            </EuiFlexItem> */}
            <EuiFlexItem>
                <EuiText>
                    <p>
                        AI-Gon Trail is a game that lets you create your own adventure in any historical or fictional setting you can imagine. Whether you want to explore the Oregon Trail, the ancient Egyptian pyramids, or even the far reaches of space, this game is fully powered by AI to make it possible. You will interact with realistic characters, face dynamic events, and make decisions that affect your survival and success. AI-Gon Trail is not just a game, it’s a journey that adapts to your choices and actions.
                    </p>
                </EuiText>
            </EuiFlexItem>
            <EuiFlexItem>
                <EuiFormRow label='Choose a theme'>
                    <EuiFieldText maxLength={50} value={theme} onChange={e => dispatch(setTheme(e.target.value))} />
                </EuiFormRow>
            </EuiFlexItem>
            <EuiFlexItem>
                <EuiFlexGroup responsive={false} alignItems='center'>
                    <EuiFlexItem grow={false}>
                        <EuiButton isLoading={props.loading} disabled={!key || props.loading} onClick={() => props.handleStart(theme)}>Start Game</EuiButton>
                    </EuiFlexItem>
                    {props.loading &&
                        <EuiFlexItem grow={false}>
                            <EuiText color='subdued'><em>Please wait while the game initializes...</em></EuiText>
                        </EuiFlexItem>
                    }
                </EuiFlexGroup>
            </EuiFlexItem>
            {props.error &&
                <EuiFlexItem>
                    <EuiText color='danger'>Failed to start the game, try again</EuiText>
                </EuiFlexItem>
            }
        </EuiFlexGroup>
    </EuiPanel>
}

export default GameStartPanel;

