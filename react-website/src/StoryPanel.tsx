import { useSelector, useDispatch } from 'react-redux';
import { addStory, RootState, setSuggestions } from "./store";
import { useLazyGetScenarioQuery } from "./api";
import { EuiButton, EuiLoadingSpinner, EuiSkeletonText, EuiText } from "@elastic/eui";
import { useEffect } from 'react';


export default function StoryPanel(props) {
    const dispatch = useDispatch();
    const session = useSelector((state: RootState) => state.game.session);
    const story = useSelector((state: RootState) => state.game.story);

    const [getScenario, getScenarioRes] = useLazyGetScenarioQuery();

    const handleGetScenario = () => {
        if (session && (story.length === 0 || story[story.length - 1].type === 'OUTCOME')) {
            console.log('Fetching scenario')
            getScenario(session).unwrap().then(res => {
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

    return <div>
        {getScenarioRes.isError && <EuiButton onClick={handleGetScenario} color='danger' >Failed to get scenario, try again</EuiButton>}
        {story.map((s, i) =>
            <EuiText color={s.invalid ? 'danger' : undefined} key={i}>
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
        )}
        {getScenarioRes.isFetching &&
            <EuiSkeletonText lines={3} size="m" isLoading={getScenarioRes.isFetching}>
            </EuiSkeletonText>
        }
    </div>
}