import {TonConnectUIProvider} from '@tonconnect/ui-react';
import {useEffect} from 'react';

import './App.css';
import {AssetsProvider} from "../../context/assets/assets.provider.tsx";
import {ModalProvider} from "../../context/modal/modal.provider.tsx";
import {useAssets} from "../../hooks/use-assets.hook.tsx";
import {Body} from '../Body/Body';
import {Header} from '../Header/Header';
import {InputAssetModal} from '../InputAssetModal/InputAssetModal';
import {OutputAssetModal} from '../OutputAssetModal/OutputAssetModal';

const tg = window.Telegram.WebApp;

function App() {
    const {getAssets} = useAssets();

    useEffect(() => {
        tg.ready();
        getAssets();
    }, [getAssets]);

    return (
        <TonConnectUIProvider manifestUrl="https://0xblackbot.github.io/rainbow-swap/tonconnect-manifest.json">
            <AssetsProvider>
                <ModalProvider>
                    <InputAssetModal/>
                    <OutputAssetModal/>
                    <div className="App">
                        <Header/>
                        <Body/>
                    </div>
                </ModalProvider>
            </AssetsProvider>
        </TonConnectUIProvider>
    );
}

export default App;
