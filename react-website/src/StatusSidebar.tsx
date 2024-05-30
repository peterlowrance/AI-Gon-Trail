import { skipToken } from "@reduxjs/toolkit/query";
import { useGetStatusQuery } from "./api";
import { RootState } from "./store";
import { useSelector} from 'react-redux';
import { EuiFlexGroup, EuiFlexItem, EuiPanel, EuiTitle } from "@elastic/eui";
import ItemPanel from "./ItemPanel";

export default function StatusSidebar(props: { hideVehicle?: boolean }) {
    const session = useSelector((state: RootState) => state.game.session);
    const { data: gameStatus, isLoading } = useGetStatusQuery(session ?? skipToken);

    const mobile = window.innerWidth <= 800;

    return gameStatus && session ?
        <EuiFlexGroup direction='column' gutterSize={mobile ? 's' : 'l'} style={{ overflowY: 'scroll', maxHeight: '100%' }}>
            {!props.hideVehicle &&
                <EuiFlexItem grow={false}>
                    <EuiPanel paddingSize={mobile ? 'xs' : 's'} hasShadow={false} hasBorder className='info-panel-apper'>
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