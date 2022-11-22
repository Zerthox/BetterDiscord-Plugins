import {React} from "dium";
import styles from "./styles.module.scss";

const limit = (input: number, min: number, max: number): number => Math.min(Math.max(input, min), max);

export interface NumberInputProps {
    value: number;
    min: number;
    max: number;
    fallback: number;
    onChange(value: number): void;
}

export const NumberInput = ({value, min, max, fallback, onChange}: NumberInputProps): JSX.Element => {
    const [isEmpty, setEmpty] = React.useState(false);

    return (
        <div className={styles.container}>
            <input
                type="number"
                className={styles.input}
                min={min}
                max={max}
                value={!isEmpty ? Math.round((value + Number.EPSILON) * 100) / 100 : ""}
                onChange={({target}) => {
                    const value = limit(parseFloat(target.value), min, max);
                    const isNaN = Number.isNaN(value);
                    setEmpty(isNaN);
                    if (!isNaN) {
                        onChange(value);
                    }
                }}
                onBlur={() => {
                    if (isEmpty) {
                        setEmpty(false);
                        onChange(fallback);
                    }
                }}
            />
            <span className={styles.unit}>%</span>
        </div>
    );
};
