import {FC} from 'react';

import styles from './ExchangeInfo.module.css';
import {GasIcon} from '../../assets/icons/GasIcon/GasIcon';
import {AssetObject} from '../../interfaces/asset-object.interface';

interface Props {
    inputAsset: AssetObject;
    outputAsset: AssetObject;
}

export const ExchangeInfo: FC<Props> = ({inputAsset, outputAsset}) => (
    <div className={styles.exchange_info_div}>
        <p>
            1 {inputAsset.name} = 2 {outputAsset.name} ($2.50)
        </p>
        <div className={styles.gas_info_div}>
            <GasIcon />
            <p className={styles.gas_info_div_p}>$0.03</p>
        </div>
    </div>
);
