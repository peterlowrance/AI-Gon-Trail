import { useSelector, useDispatch } from 'react-redux';
import { addStory, RootState, setSuggestions } from "./store";
import { useLazyGetScenarioQuery } from "./api";
import { EuiText } from "@elastic/eui";
import { useEffect } from 'react';


export default function StoryPanel(props) {
    const dispatch = useDispatch();
    const session = useSelector((state: RootState) => state.game.session);
    const story = useSelector((state: RootState) => state.game.story);

    const [getScenario] = useLazyGetScenarioQuery();

    useEffect(() => {
        if (session && (story.length === 0 || story[story.length - 1].type === 'OUTCOME')) {
            console.log('Fetching scenario')
            getScenario(session).unwrap().then(res => {
                dispatch(setSuggestions(res.suggestions));
                dispatch(addStory({ text: res.scenario, type: 'SCENARIO' }));
            });
        }
    }, [story])

    return <div>
        {story.map((s, i) =>
            <EuiText color={s.invalid ? 'danger' : undefined} key={i}>
                <p>
                    {s.text}
                </p>
                {s.type === 'OUTCOME' && <br />}
                {s.invalidMsg &&
                    <p>
                        {s.invalidMsg}
                    </p>
                }
            </EuiText>
        )}
    </div>
}