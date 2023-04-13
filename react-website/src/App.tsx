import { EuiFlexGroup, EuiFlexItem, EuiHideFor, EuiPanel, EuiShowFor, EuiSpacer, EuiText } from "@elastic/eui";
import UserInput from "./UserInput";
import PurchaseItemPanel from "./PurchaseItemPanel";
import { RootState, addStory, setGameState, setItemsToBuy, setSession } from "./store";
import { useLazyGetGameEndQuery, useLazyGetGameStartQuery } from "./api";
import { useDispatch, useSelector } from 'react-redux';
import StatusSidebar from "./StatusSidebar";
import StoryPanel from "./StoryPanel";
import { useEffect, useState } from "react";
import GameStartPanel from "./GameStartPanel";
import { getBackgroundImage } from "../images/image_manager";
import wood_background from '../wood_background.jpg';
import MobileStatusAccordion from "./MobileStatusAccordion";

function App() {
  const dispatch = useDispatch();
  const gameState = useSelector((state: RootState) => state.game.gameState);
  const gameOver = useSelector((state: RootState) => state.game.gameOver);
  const key = useSelector((state: RootState) => state.game.key);
  const session = useSelector((state: RootState) => state.game.session);
  const lastStory = useSelector((state: RootState) => state.game.story[state.game.story.length - 1]);
  const [background, setBackground] = useState(getBackgroundImage(''));
  const [desc, setDesc] = useState('');

  const [getGameStart, gameStartRes] = useLazyGetGameStartQuery();
  const [getGameEnd, gameEndRes] = useLazyGetGameEndQuery();

  const handleStart = (theme) => {
    getGameStart({ theme: theme, key: key }).unwrap().then(res => {
      dispatch(setSession(res.session));
      dispatch(setItemsToBuy(res.items));
      dispatch(setGameState('CHOOSING_ITEMS'));
      setDesc(res.description);
    });
  }

  useEffect(() => {
    if (lastStory && lastStory.type === 'SCENARIO') {
      console.log('getting new image')
      const newBackground = getBackgroundImage(lastStory.text);
      if (newBackground) {
        setBackground(newBackground);
      }
    }
  }, [lastStory]);

  useEffect(() => {
    if (session && gameOver && lastStory?.type === 'LAST_OUTCOME') {
      getGameEnd({ session: session, key: key, prevOutcome: lastStory.text }).unwrap().then(res => {
        dispatch(addStory({ text: res, type: 'GAME_END' }))
      });
    }
  }, [gameOver, lastStory?.type])

  return <>
    <EuiFlexGroup direction='row' gutterSize='none' style={{ height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <EuiHideFor sizes={['xs', 's']}>
        <EuiFlexItem grow={false} style={{ minWidth: 240 }}>
          <EuiPanel hasBorder={false} borderRadius='none' color='subdued' style={{ backgroundImage: `url(${wood_background})`, backgroundRepeat: 'round', backgroundPosition: 'bottom center', border: '5px solid #4b3732', height: '100%' }}>
            <StatusSidebar />
          </EuiPanel>
        </EuiFlexItem>
      </EuiHideFor>
      {/* Main page */}
      <EuiFlexItem className='eui-fullHeight' style={{ backgroundImage: `url(${background})`, backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundPosition: 'bottom center' }}>
        <EuiPanel hasBorder={false} borderRadius='none' color='transparent' className='eui-fullHeight'>
          <EuiFlexGroup gutterSize='m' direction='column' className='eui-fullHeight'>
            {/* Header */}
            {gameState === 'NOT_STARTED' &&
              <EuiFlexItem grow={false} style={{ width: '100%', maxWidth: 1000, marginLeft: 'auto', marginRight: 'auto' }}>
                <GameStartPanel handleStart={handleStart} loading={gameStartRes.isFetching} error={gameStartRes.isError} />
              </EuiFlexItem>
            }
            {/* On mobile view, status goes here */}
            <EuiShowFor sizes={['xs', 's']}>
              {gameState === 'CHOOSING_ITEMS' || gameState === 'FACING_SCENARIOS' &&
                <EuiFlexItem grow={false} style={{ width: '100%', maxWidth: 1000, marginLeft: 'auto', marginRight: 'auto' }}>
                  <MobileStatusAccordion />
                </EuiFlexItem>
              }
            </EuiShowFor>
            <EuiFlexItem id='scrolling-div' style={{ overflowY: 'scroll', width: '100%', maxWidth: 1000, marginLeft: 'auto', marginRight: 'auto' }} grow>
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
            </EuiFlexItem>
            {gameState === 'FACING_SCENARIOS' &&
              <EuiFlexItem grow={false}>
                <UserInput disabled={!!gameOver} />
              </EuiFlexItem>
            }
          </EuiFlexGroup>
        </EuiPanel>
      </EuiFlexItem>
    </EuiFlexGroup >
  </>
}

export default App;
