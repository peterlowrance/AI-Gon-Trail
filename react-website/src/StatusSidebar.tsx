import { skipToken } from "@reduxjs/toolkit/dist/query";
import { useGetStatusQuery } from "./api";
import { RootState } from "./store";
import { useSelector } from 'react-redux';
import { EuiButton, EuiFlexGroup, EuiFlexItem, EuiPanel, EuiSpacer, EuiTitle } from "@elastic/eui";
import Item, { parseText } from "./Item";
import { Fragment, useState } from "react";

export default function StatusSidebar(props) {
    const session = useSelector((state: RootState) => state.game.session);
    const { data: gameStatus, isLoading } = useGetStatusQuery(session ?? skipToken);

    return gameStatus ?
        <EuiFlexGroup direction='column'>
            <EuiFlexItem>
                <EuiTitle size='s'>
                    <h3 style={{ paddingLeft: 16 }}>
                        {gameStatus.vehicle}
                    </h3>
                </EuiTitle>
            </EuiFlexItem>
            <EuiFlexItem>
                <EuiPanel>
                    <EuiTitle size='xs'>
                        <h3>Characters:</h3>
                    </EuiTitle>
                    {gameStatus.characters.map(c =>
                        <Fragment key={c}>
                            <EuiSpacer size='xs' />
                            <Item value={c} />
                        </Fragment>
                    )}
                </EuiPanel>
            </EuiFlexItem>
            <EuiFlexItem>
                <EuiPanel>
                    <EuiTitle size='xs'>
                        <h3>Items:</h3>
                    </EuiTitle>
                    {gameStatus.items.map(item =>
                        <Fragment key={parseText(item)}>
                            <EuiSpacer size='xs' />
                            <Item value={item} />
                        </Fragment>
                    )}
                </EuiPanel>
            </EuiFlexItem>
        </EuiFlexGroup>
        : null;
}