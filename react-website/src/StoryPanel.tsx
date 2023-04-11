import { useSelector, useDispatch } from 'react-redux';
import { addStory, RootState, setSuggestions } from "./store";
import { useLazyGetScenarioQuery } from "./api";
import { EuiButton, EuiPanel, EuiSkeletonRectangle, EuiSpacer, EuiText } from "@elastic/eui";
import { useEffect } from 'react';
import StoryChanges from './StoryChanges';


export default function StoryPanel(props) {
    const dispatch = useDispatch();
    const session = useSelector((state: RootState) => state.game.session);
    const story = useSelector((state: RootState) => state.game.story);
    const key = useSelector((state: RootState) => state.game.key);

    const [getScenario, getScenarioRes] = useLazyGetScenarioQuery();

    const handleGetScenario = () => {
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


    return <div style={{ marginBottom: '15vw' }}>
        {story.map((s, i) =>
            <EuiPanel key={i} hasBorder style={{ marginBottom: 16 }}>
                <EuiText color={s.invalid ? 'danger' : undefined}>
                    <p>
                        {s.type === 'ACTION' ?
                            <em>{s.text}</em>
                            :
                            s.text
                        }
                    </p>
                    {/* If there are any changes, add spacing */}
                    {(s.characterChanges?.added?.length || s.characterChanges?.removed?.length || s.characterChanges?.changed ||
                        s.itemChanges?.added?.length || s.itemChanges?.removed?.length || s.itemChanges?.changed) &&
                        <EuiSpacer size='m' />
                    }
                    {s.characterChanges &&
                        <StoryChanges type='Character' changes={s.characterChanges} />
                    }
                    {s.itemChanges &&
                        <StoryChanges type='Item' changes={s.itemChanges} />
                    }
                    {s.invalidMsg &&
                        <p>
                            {s.invalidMsg}
                        </p>
                    }
                </EuiText>
            </EuiPanel>
        )}
        {getScenarioRes.isError && <EuiButton onClick={handleGetScenario} color='danger' >Failed to get scenario, try again</EuiButton>}
        {getScenarioRes.isFetching &&
            <EuiSkeletonRectangle
                width="100%"
                borderRadius="m"
                className='delay-appear'
                isLoading={getScenarioRes.isFetching}
            />
        }
    </div>
}