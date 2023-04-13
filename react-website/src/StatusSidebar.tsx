import { skipToken } from "@reduxjs/toolkit/dist/query";
import { useGetStatusQuery } from "./api";
import { RootState, setGameOver } from "./store";
import { useSelector , useDispatch} from 'react-redux';
import { EuiFlexGroup, EuiFlexItem, EuiPanel, EuiTitle } from "@elastic/eui";
import ItemPanel from "./ItemPanel";
import { useEffect } from "react";

export default function StatusSidebar(props: { hideVehicle?: boolean }) {
    const dispatch = useDispatch();
    const session = useSelector((state: RootState) => state.game.session);
    const { data: gameStatus, isLoading } = useGetStatusQuery(session ?? skipToken);

    useEffect(() => {
        if (gameStatus?.game_over) {
            dispatch(setGameOver(gameStatus.game_over));
        }
    }, [gameStatus?.game_over])

    const mobile = window.innerWidth <= 800;

    return gameStatus && session ?
        <EuiFlexGroup direction='column' gutterSize={mobile ? 's' : 'l'} style={{ overflowY: 'scroll', maxHeight: '100vh' }}>
            {!props.hideVehicle &&
                <EuiFlexItem grow={false}>
                    <EuiPanel paddingSize={mobile ? 'xs' : 's'} hasShadow={false} hasBorder>
                        <EuiTitle size='s'>
                            <h3>
                                {gameStatus.vehicle}
                            </h3>
                        </EuiTitle>
                    </EuiPanel>
                </EuiFlexItem>
            }
            <EuiFlexItem grow={false}>
                <ItemPanel items={gameStatus.characters} title='Characters' />
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
                <ItemPanel items={gameStatus.items} title='Items' />
            </EuiFlexItem>
        </EuiFlexGroup>
        : null;
}