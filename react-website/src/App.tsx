import { EuiButton, EuiPageTemplate } from "@elastic/eui";
import UserInput from "./UserInput";
import PurchaseItemPanel from "./PurchaseItemPanel";
import { RootState, setGameState, setItemsToBuy, setSession } from "./store";
import { useLazyGetGameStartQuery } from "./api";
import { useDispatch, useSelector } from 'react-redux';
import StatusSidebar from "./StatusSidebar";
import StoryPanel from "./StoryPanel";


function App() {
  const dispatch = useDispatch();
  const gameState = useSelector((state: RootState) => state.game.gameState);

  const [getGameStart] = useLazyGetGameStartQuery();

  const handleStart = () => {
    getGameStart('Oregon Trail').unwrap().then(res => {
      dispatch(setSession(res.session));
      dispatch(setItemsToBuy(res.items));
      dispatch(setGameState('CHOOSING_ITEMS'))
    });
  }

  return <EuiPageTemplate
    panelled={true}
    grow={true}
    responsive={['s']}
  >
    <EuiPageTemplate.Sidebar sticky={true}>
      <StatusSidebar />
    </EuiPageTemplate.Sidebar>
    <EuiPageTemplate.Header pageTitle={'The AI-Gon Trail'} >
      {gameState === 'NOT_STARTED' && <EuiButton onClick={handleStart}>Start</EuiButton>}
    </EuiPageTemplate.Header>
    <EuiPageTemplate.Section grow={true}>
      <div style={{ height: '100%', overflowY: 'scroll' }} >
        {gameState === 'CHOOSING_ITEMS' &&
          <PurchaseItemPanel />
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
