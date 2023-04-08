import { useSelector, useDispatch } from 'react-redux';
import { addStory, RootState, setSuggestions } from "./store";
import { useLazyGetScenarioQuery } from "./api";
import { EuiButton, EuiPanel, EuiSkeletonRectangle, EuiText, useResizeObserver } from "@elastic/eui";
import { useEffect, useRef } from 'react';


export default function StoryPanel(props) {
    const dispatch = useDispatch();
    const session = useSelector((state: RootState) => state.game.session);
    const story = useSelector((state: RootState) => state.game.story);
    const key = useSelector((state: RootState) => state.game.key);
    const lastStoryRef = useRef<any>();

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

    const lastStoryHeight = useResizeObserver(lastStoryRef.current).height;

    return <div style={{marginBottom: '15vw'}}>
        {getScenarioRes.isError && <EuiButton onClick={handleGetScenario} color='danger' >Failed to get scenario, try again</EuiButton>}
        {story.map((s, i) =>
            <EuiPanel key={i} hasBorder style={{ marginBottom: 16 }}>
                <EuiText color={s.invalid ? 'danger' : undefined}>
                    <p>
                        {s.type === 'ACTION' ? <em>{s.text}</em> : s.text}
                    </p>
                    {s.type === 'OUTCOME' && <br />}
                    {s.invalidMsg &&
                        <p>
                            {s.invalidMsg}
                        </p>
                    }
                </EuiText>
            </EuiPanel>
        )}
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