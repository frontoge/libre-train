import { Progress } from "antd"

type NutritionBarProps = {
    label: string;
    value: number;
    maxValue: number;
    color?: string;
    unit?: string;
}

export function NutritionBar(props: NutritionBarProps) {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '6rem',
            alignItems: 'center',
            justifyContent: 'end',
            width: '100%',
        }}>
            <h3 style={{
                width: "20%"
            }}>
                {props.label}
            </h3>
            <Progress strokeColor={props.color} style={{justifySelf: 'end'}} type="line" percent={(props.value / props.maxValue) * 100} format={() => `${props.value}/${props.maxValue}${props.unit ?? ''}`}/>
        </div>
    )
}