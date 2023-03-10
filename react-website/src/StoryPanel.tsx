import UserInput from "./UserInput";
import {useSelector} from 'react-redux';
import { RootState } from "./store";
import { useGetStatusQuery } from "./api";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import { EuiText } from "@elastic/eui";


export default function StoryPanel(props) {

    const scenario = useSelector((state: RootState) => state.game.session);

    const {data: gameStatus} = useGetStatusQuery(scenario ?? skipToken);

    return <div>
        <EuiText>
            {gameStatus?.current_scenario}
        </EuiText>
    </div>
}