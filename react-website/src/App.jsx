import { useEffect, useState } from "react";
import StatusPanel from "./StatusPanel";
import StoryPanel from "./StoryPanel";
import axios from "axios";
import { EuiButton, EuiSuperSelect } from "@elastic/eui";

const GAME_STATE = {
  NOT_STARTED: 'NOT_STARTED',
  CHOOSING_ITEMS: 'CHOOSING_ITEMS',
  FACING_SCENARIOS: 'FACING_SCENARIOS'
}

function App() {
  const [gameState, setGameState] = useState(GAME_STATE.NOT_STARTED);
  const [theme, setTheme] = useState('Oregon Trail');
  const [itemsToBuy, setItemsToBuy] = useState(null);
  const [crew, setCrew] = useState(null);
  const [wagon, setWagon] = useState(null);
  const [description, setDescription] = useState(null);

  const handleStart = () => {
    const url = `${window.location.origin}/api/game-start-items?theme=${theme}`;
    axios.get(url).then((res) => {
      const { items, crew, wagon, description } = res.data;
      setItemsToBuy(items);
      setCrew(crew);
      setWagon(wagon);
      setDescription(description);
    });
  }

  return <div>
    <EuiSuperSelect
      options={['Oregon Trail', 'Space', 'Star Wars', 'Underground'].map(t =>
        ({ value: t, inputDisplay: t })
      )}
      valueOfSelected={theme}
      onChange={val => setTheme(val)}
    />
    <EuiButton onClick={handleStart}>Start</EuiButton>
    {itemsToBuy && Object.entries(itemsToBuy)}
    <p>{crew}</p>
    <p>{wagon}</p>
    <p>{description}</p>
    <StoryPanel />
    <StatusPanel />
  </div>;
}

export default App;
