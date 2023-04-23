import { useSelector, useDispatch } from 'react-redux';
import { addStory, restart, RootState, setSuggestions, StoryType } from "./store";
import { useLazyGetScenarioQuery } from "./api";
import { EuiButton, EuiPanel, EuiSkeletonRectangle, EuiSpacer, EuiText } from "@elastic/eui";
import { useEffect } from 'react';
import StoryChanges from './StoryChanges';


export default function StoryPanel(props) {
    const dispatch = useDispatch();
    const session = useSelector((state: RootState) => state.game.session);
    const story = useSelector((state: RootState) => state.game.story);
    const key = useSelector((state: RootState) => state.game.key);
    const gameOver = useSelector((state: RootState) => state.game.gameOver);

    const [getScenario, getScenarioRes] = useLazyGetScenarioQuery();

    const handleGetScenario = () => {
        // Fetch a new scenario if the last scenario is an outcome or if there are no scenarios
        if (session && (story.length === 0 || story[story.length - 1].type === 'OUTCOME')) {
            console.log('Fetching scenario')
            getScenario({ session: session, key: key }).unwrap().then(res => {
                dispatch(setSuggestions(res.suggestions));
                dispatch(addStory({ text: res.scenario, type: 'SCENARIO' }));
            }).catch(res => {
                console.error(res);
                alert('Failed to get scenario');
            });
        }
    }

    useEffect(() => {
        handleGetScenario();
    }, [story])

    const getPanelColor = (type: StoryType) => {
        if (type === 'GAME_END') {
            return gameOver === 'WIN' ? 'success' : 'danger';
        }
    }

    return <div style={{ marginBottom: '15vw' }}>
        {story.map((s, i) =>
            <EuiPanel className={i === story.length - 1 ? 'story-appear' : undefined} key={i} color={getPanelColor(s.type)} hasBorder style={{ marginBottom: 16 }}>
                <EuiText color={s.invalid ? 'danger' : undefined}>
                    <p>
                        {s.type === 'ACTION' ?
                            <em>{s.text}</em>
                            :
                            s.text
                        }
                    </p>
                    {s.quote &&
                        <p style={{marginTop: 16}}>{s.quote.split(':')[0]}: <em>"{s.quote.split(/:(.+)/)[1].trim()}"</em></p>
                    }
                    {/* If there are any changes, add spacing */}
                    {(s.characterChanges?.added?.length || s.characterChanges?.removed?.length || s.characterChanges?.changed ||
                        s.itemChanges?.added?.length || s.itemChanges?.removed?.length || s.itemChanges?.changed ||
                        s.vehicleChanges) &&
                        <EuiSpacer size='m' />
                    }
                    {s.characterChanges &&
                        <StoryChanges type='Character' changes={s.characterChanges} />
                    }
                    {s.itemChanges &&
                        <StoryChanges type='Item' changes={s.itemChanges} />
                    }
                    {s.vehicleChanges &&
                        <StoryChanges type='Vehicle' changes={{ added: [], removed: [], changed: s.vehicleChanges }} />
                    }
                    {s.invalidMsg &&
                        <p>
                            {s.invalidMsg}
                        </p>
                    }
                    {s.type === 'GAME_END' &&
                        <EuiButton style={{ marginTop: 8 }} color='primary' onClick={() => dispatch(restart())}>Restart Game</EuiButton>
                    }
                </EuiText>
            </EuiPanel>
        )}
        {getScenarioRes.isError && <EuiButton onClick={handleGetScenario} color='danger' >Failed to get scenario, try again</EuiButton>}
        {getScenarioRes.isFetching &&
            <EuiSkeletonRectangle
                width="100%"
                borderRadius="m"
                className={story.length === 0 ? 'delay-appear-quick' : 'delay-appear'}
                isLoading={getScenarioRes.isFetching}
            />
        }
    </div>
}