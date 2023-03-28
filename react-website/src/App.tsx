import { EuiButton, EuiHeader, EuiPageTemplate, EuiSpacer, EuiText } from "@elastic/eui";
import UserInput from "./UserInput";
import PurchaseItemPanel from "./PurchaseItemPanel";
import { addStory, RootState, setGameState, setItemsToBuy, setSession } from "./store";
import { useLazyGetGameStartQuery } from "./api";
import { useDispatch, useSelector } from 'react-redux';
import StatusSidebar from "./StatusSidebar";
import StoryPanel from "./StoryPanel";
import { useState } from "react";

function App() {
  const dispatch = useDispatch();
  const gameState = useSelector((state: RootState) => state.game.gameState);
  const [desc, setDesc] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 800);


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

  return <EuiPageTemplate
    panelled={true}
    grow={true}
    responsive={['s']}
  >
    {sidebarOpen &&
      <EuiPageTemplate.Sidebar responsive={['xs']} sticky>
        <StatusSidebar />
      </EuiPageTemplate.Sidebar>
    }
    <EuiPageTemplate.Header
      pageTitle={'The AI-Gon Trail'}
      title='The Ai-Gon Trail'
      rightSideItems={[
        <EuiButton size='s' onClick={handleAddKey}>{gameState === 'NO_KEY' ? 'Add key' : 'Change key'}</EuiButton>,
        // Mobile view toggle
        window.innerWidth <= 800 && <EuiButton style={{position: 'absolute', top: 8, right: 8}} size='s' color='text' onClick={() => setSidebarOpen(!sidebarOpen)}>{sidebarOpen ? 'Hide status' : 'View status'}</EuiButton>
      ]}
    >
      {gameState === 'NO_KEY' && <EuiText>Add a key to begin</EuiText>}
      {gameState === 'NOT_STARTED' && <EuiButton isLoading={gameStartRes.isFetching} disabled={gameStartRes.isFetching} onClick={handleStart}>Start</EuiButton>}
      {gameStartRes.isError && <EuiText color='danger'>Failed to start the game, try again</EuiText>}
    </EuiPageTemplate.Header>
    <EuiPageTemplate.Section grow={true}>
      <div style={{ height: '100%', overflowY: 'scroll' }} >
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
      </div>
    </EuiPageTemplate.Section>
    <EuiPageTemplate.Section grow={false}>
      <UserInput disabled={gameState === 'NOT_STARTED' || gameState === 'CHOOSING_ITEMS'} />
    </EuiPageTemplate.Section>
  </EuiPageTemplate>
}

export default App;
