import { skipToken } from "@reduxjs/toolkit/dist/query";
import { useGetStatusQuery } from "./api";
import { RootState } from "./store";
import { useSelector } from 'react-redux';
import { EuiFlexGroup, EuiFlexItem, EuiPanel, EuiSpacer, EuiTitle } from "@elastic/eui";
import Item from "./Item";
import { Fragment, useState } from "react";
import ItemPanel from "./ItemPanel";

export default function StatusSidebar(props) {
    const session = useSelector((state: RootState) => state.game.session);
    const { data: gameStatus, isLoading } = useGetStatusQuery(session ?? skipToken);

    const mobile = window.innerWidth <= 800;

    return gameStatus ?
        <EuiFlexGroup direction='column' gutterSize={mobile ? 's' : 'l'} style={{overflowY: 'scroll'}}>
            <EuiFlexItem>
                <EuiTitle size='s'>
                    <h3 style={{ paddingLeft: 16 }}>
                        {gameStatus.vehicle}
                    </h3>
                </EuiTitle>
            </EuiFlexItem>
            <EuiFlexItem>
                <ItemPanel items={gameStatus.characters} title='Characters' />
            </EuiFlexItem>
            <EuiFlexItem>
                <ItemPanel items={gameStatus.items} title='Items' />
            </EuiFlexItem>
        </EuiFlexGroup>
        : null;
}