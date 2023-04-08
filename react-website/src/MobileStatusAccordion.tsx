import { EuiAccordion, EuiPanel, EuiSpacer, EuiTitle } from "@elastic/eui";
import StatusSidebar from "./StatusSidebar";
import wood_background from '../wood_background.jpg';
import { useGetStatusQuery } from "./api";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import { useSelector } from 'react-redux';
import { RootState } from "./store";

function MobileStatusAccordion(props) {
    const session = useSelector((state: RootState) => state.game.session);
    const { data: gameStatus } = useGetStatusQuery(session ?? skipToken);

    return <EuiPanel color='primary' paddingSize='s' style={{ backgroundImage: `url(${wood_background})`, backgroundRepeat: 'repeat', backgroundPosition: 'center top', backgroundSize: '100%', border: '5px solid #4b3732' }}>
        <EuiAccordion
            id='mobile-status-accordion'
            buttonProps={{ style: { color: 'white', fontWeight: 'bold' } }}
            arrowProps={{ style: { color: 'white' } } as any}
            buttonContent={<EuiTitle size='xs'><h3 style={{ color: 'white' }}>{gameStatus?.vehicle ?? 'Status'}</h3></EuiTitle>}
        >
            <EuiSpacer size='xs' />
            <StatusSidebar hideVehicle />
        </EuiAccordion>
    </EuiPanel>;
}

export default MobileStatusAccordion;