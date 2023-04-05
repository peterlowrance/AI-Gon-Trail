import { EuiAccordion, EuiFlexGroup, EuiFlexItem, EuiGlobalToastList, EuiHideFor, EuiPanel, EuiShowFor, EuiSpacer, EuiText } from "@elastic/eui";
import UserInput from "./UserInput";
import PurchaseItemPanel from "./PurchaseItemPanel";
import { removeToast, RootState, setGameState, setItemsToBuy, setSession } from "./store";
import { useLazyGetGameStartQuery } from "./api";
import { useDispatch, useSelector } from 'react-redux';
import StatusSidebar from "./StatusSidebar";
import StoryPanel from "./StoryPanel";
import { useState } from "react";
import background from '../images/00014-2437541345.png';
import GameStartPanel from "./GameStartPanel";


function App() {
  const dispatch = useDispatch();
  const gameState = useSelector((state: RootState) => state.game.gameState);
  const toasts = useSelector((state: RootState) => state.game.toasts);
  const win = useSelector((state: RootState) => state.game.win);
  const [desc, setDesc] = useState('');

  const [getGameStart, gameStartRes] = useLazyGetGameStartQuery();

  const handleStart = () => {
    getGameStart('Oregon Trail').unwrap().then(res => {
      dispatch(setSession(res.session));
      dispatch(setItemsToBuy(res.items));
      dispatch(setGameState('CHOOSING_ITEMS'));
      setDesc(res.description);
    });
  }

  return <>
    <EuiFlexGroup direction='row' gutterSize='none' style={{ height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <EuiHideFor sizes={['xs', 's']}>
        <EuiFlexItem grow={false} style={{ minWidth: 240 }}>
          <EuiPanel hasBorder={false} borderRadius='none' color='subdued'>
            <StatusSidebar />
          </EuiPanel>
        </EuiFlexItem>
      </EuiHideFor>
      {/* Main page */}
      <EuiFlexItem className='eui-fullHeight' style={{ backgroundImage: `url(${background})`, backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundPosition: 'center center' }}>
        <EuiPanel hasBorder={false} borderRadius='none' color='transparent' className='eui-fullHeight'>
          <EuiFlexGroup gutterSize='m' direction='column' className='eui-fullHeight'>
            {/* Header */}
            {gameState === 'NOT_STARTED' &&
              <EuiFlexItem grow={false}>
                <GameStartPanel handleStart={handleStart} loading={gameStartRes.isLoading} error={gameStartRes.isError} />
              </EuiFlexItem>
            }
            {/* On mobile view, status goes here */}
            <EuiShowFor sizes={['xs', 's']}>
              {gameState === 'CHOOSING_ITEMS' || gameState === 'FACING_SCENARIOS' &&
                <EuiFlexItem grow={false}>
                  <EuiPanel color='subdued' paddingSize='s'>
                    <EuiAccordion
                      id='mobile-status-accordion'
                      buttonContent='Status'
                    >
                      <StatusSidebar />
                    </EuiAccordion>
                  </EuiPanel>
                </EuiFlexItem>
              }
            </EuiShowFor>
            <EuiFlexItem id='scrolling-div' style={{ overflowY: 'scroll' }} grow>
              {gameState === 'CHOOSING_ITEMS' &&
                <>
                  <EuiPanel hasBorder grow={false}>
                    <EuiText>{desc}</EuiText>
                  </EuiPanel>
                  <EuiSpacer />
                  <PurchaseItemPanel />
                </>
              }
              {gameState === 'FACING_SCENARIOS' &&
                <StoryPanel />
              }
              <EuiSpacer size='xs' />
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <UserInput disabled={win || gameState === 'NOT_STARTED' || gameState === 'CHOOSING_ITEMS'} />
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiPanel>
      </EuiFlexItem>
    </EuiFlexGroup>
    <EuiGlobalToastList
      toasts={toasts}
      dismissToast={t => dispatch(removeToast(t.id))}
      toastLifeTimeMs={5000}
    />
  </>
}

export default App;
