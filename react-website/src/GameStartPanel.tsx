
function GameStartPanel() {
    const key = useSelector((state: RootState) => state.game.key);  
    const handleStart = () => {
    console.log();
}
    return <EuiPanel hasBorder >
<EuiFlexGroup direction='column'>

<EuiFlexItem><EuiTitle><h1>Welcome to AI-Gon Trail</h1></EuiTitle></EuiFlexItem>
<EuiFlexItem>
<EuiFormRow label='Enter your OpenAI key'>
<EuiInput value={key} onChange={e => dispatch(setKey(e.target.value))} />
</EuiFormRow>
</EuiFlexItem>
<EuiFlexItem><EuiButton disabled={!key} onClick={handleStart} >Start Game</EuiButton></EuiFlexItem>

</EuiFlexGroup>
</EuiPanel>
}

export default GameStartPanel;

