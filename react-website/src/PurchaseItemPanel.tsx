import { EuiButton, EuiFlexGroup, EuiFlexItem, EuiPanel, EuiSpacer, EuiText, EuiTitle } from "@elastic/eui"
import { useState } from "react"
import Item from "./Item"
import { useSelector, useDispatch } from 'react-redux';
import { RootState, setGameState } from "./store";
import { useChooseItemsMutation } from "./api";


export default function PurchaseItemPanel() {
    const dispatch = useDispatch()
    const [selectedItems, setSelectedItems] = useState([] as string[]);
    const itemsToBuy = useSelector((state: RootState) => state.game.itemsToBuy);
    const session = useSelector((state: RootState) => state.game.session);

    const [chooseItems, chooseItemsRes] = useChooseItemsMutation();

    let moneyLeft = 100;
    selectedItems.forEach(item => {
        const thisCost = itemsToBuy[item];
        moneyLeft -= thisCost;
    })

    const toggleItem = (val: string) => {
        if (selectedItems.includes(val)) {
            setSelectedItems(selectedItems.filter(i => i !== val));
        }
        else {
            const thisCost = itemsToBuy[val];
            if (moneyLeft - thisCost >= 0) {
                setSelectedItems([...selectedItems, val]);
            }
        }
    }

    const handlePurchaseItems = () => {
        if (session)
            chooseItems({ session: session, items: selectedItems }).unwrap()
                .then(() => {
                    dispatch(setGameState('FACING_SCENARIOS'));
                })
                .catch((e) => {
                    alert('Failed to start the game, try again later.');
                    window.location.reload();
                });
    }

    return <EuiPanel hasBorder grow={false} className='info-panel-apper'>
        <EuiFlexGroup direction='column' style={{height: '100%'}} gutterSize='none'>
            <EuiFlexItem grow={false} style={{marginBottom: 16}}>
                <EuiTitle size='s'>
                    <h2>
                        Select items to purchase
                    </h2>
                </EuiTitle>
            </EuiFlexItem>
            <EuiFlexItem grow={false} style={{marginBottom: 16}}>
                <EuiFlexGroup gutterSize='xs' wrap responsive={false}>
                    {itemsToBuy && Object.entries(itemsToBuy).map(([item, cost]) =>
                        <EuiFlexItem grow={false} key={item}>
                            <Item value={item} cost={cost} selected={selectedItems.includes(item)} onClick={chooseItemsRes.isLoading ? undefined : () => toggleItem(item)} />
                        </EuiFlexItem>
                    )}
                </EuiFlexGroup>
            </EuiFlexItem>
            <EuiFlexItem grow />
            {session &&
                <EuiFlexItem grow={false}>
                    <EuiFlexGroup justifyContent='spaceBetween' alignItems='baseline' responsive={false}>
                        <EuiFlexItem grow={false}>
                            <EuiButton isLoading={chooseItemsRes.isLoading} onClick={handlePurchaseItems}>Purchase Items</EuiButton>
                        </EuiFlexItem>
                        <EuiFlexItem grow={false}>
                            <EuiText>
                                ${moneyLeft}
                            </EuiText>
                        </EuiFlexItem>
                    </EuiFlexGroup>
                </EuiFlexItem>
            }
        </EuiFlexGroup>
    </EuiPanel>
}