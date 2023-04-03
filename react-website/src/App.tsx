import { EuiAccordion, EuiButton, EuiFlexGroup, EuiFlexItem, EuiGlobalToastList, EuiHeader, EuiHideFor, EuiPageTemplate, EuiPanel, EuiShowFor, EuiSpacer, EuiText, EuiTitle } from "@elastic/eui";
import UserInput from "./UserInput";
import PurchaseItemPanel from "./PurchaseItemPanel";
import { addStory, removeToast, RootState, setGameState, setItemsToBuy, setSession } from "./store";
import { useLazyGetGameStartQuery } from "./api";
import { useDispatch, useSelector } from 'react-redux';
import StatusSidebar from "./StatusSidebar";
import StoryPanel from "./StoryPanel";
import { useState } from "react";

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

  const handleAddKey = () => {
    const key = prompt('Enter your key', window.key);
    if (key) {
      window.key = key;
    }
    dispatch(setGameState('NOT_STARTED'));
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
      <EuiFlexItem className='eui-fullHeight'>
        <EuiPanel hasBorder={false} borderRadius='none' color='plain' className='eui-fullHeight'>
          <EuiFlexGroup direction='column' className='eui-fullHeight'>
            {/* Header */}
            <EuiFlexItem grow={false}>
{gameState === 'NOT_STARTED' && 
<StartGamePanel />
}
              <EuiTitle><h1>AI-Gon Trail</h1></EuiTitle>
              {gameState === 'NO_KEY' &&
                <EuiFlexGroup>
                  <EuiFlexItem grow={false}>
                    <EuiText>Add a key to begin</EuiText>
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
                    <EuiButton size='s' onClick={handleAddKey}>{gameState === 'NO_KEY' ? 'Add key' : 'Change key'}</EuiButton>
                  </EuiFlexItem>
                </EuiFlexGroup>
              }
              {gameState === 'NOT_STARTED' && <EuiButton isLoading={gameStartRes.isFetching} disabled={gameStartRes.isFetching} onClick={handleStart}>Start</EuiButton>}
              {gameStartRes.isError && <EuiText color='danger'>Failed to start the game, try again</EuiText>}
            </EuiFlexItem>
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
                  <EuiText>{desc}</EuiText>
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
