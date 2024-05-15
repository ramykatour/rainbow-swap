import {useIsConnectionRestored, useTonAddress} from '@tonconnect/ui-react';
import {useEffect} from 'react';

import styles from './app.module.css';
import {Home} from '../../screens/home/home.tsx';
import {useDispatch} from '../../store';
import {loadAssetsActions} from '../../store/assets/assets-actions.ts';
import {balancesActions} from '../../store/balances/balances-actions.ts';
//import {useBalancesSelector} from '../../store/balances/balances-selectors.ts';
import {Header} from '../header/header.tsx';

const tg = window.Telegram.WebApp;

export const App = () => {
    const dispatch = useDispatch();
    const connectionRestored = useIsConnectionRestored();
    const walletAddress = useTonAddress();
    //const balances = useBalancesSelector();

    useEffect(() => {
        tg.ready();
        dispatch(loadAssetsActions.submit());
        dispatch(balancesActions.submit({walletAddress}));
    }, [dispatch, walletAddress]);

    return (
        <div className={styles.App}>
            <Header />
            {connectionRestored && <Home />}
        </div>
    );
};
