import { Badge, Card, Descriptions, Tag } from "antd";
import type { Mesocycle } from "../../../../shared/models";
import { stringFormatCondensedDate } from "../../helpers/date-helpers";
import { cardioLevelTagColors, optLevelTagColors } from "../../helpers/training-helpers";
import dayjs from "../../config/dayjs";

export interface MesocycleCardProps extends React.ComponentProps<"div"> {
    mesocycleData?: Mesocycle;
    index?: number;
}

export function MesocycleCard(props: MesocycleCardProps) {

    const { mesocycleData, ...restProps } = props; 
    const startDate = mesocycleData?.cycle_start_date ? stringFormatCondensedDate(mesocycleData.cycle_start_date, '/') : '';
    const endDate = mesocycleData?.cycle_end_date ? stringFormatCondensedDate(mesocycleData.cycle_end_date, '/') : '';
    const dateString = startDate !== endDate ? `${startDate} - ${endDate}` : startDate;

    const dataFields = [
        {
            key: "date_range",
            label: "Date Range",
            span: 'filled',
            children: dateString
        },
        {
            key: "opt_levels",
            label: "Opt Levels",
            span: 'filled',
            children: mesocycleData?.optLevels?.map(level => (
                // @ts-ignore this is only supported in antd v6+ will leave it in for when we update
                <Tag key={level} color={optLevelTagColors[level]} variant="outlined">
                    {`${level}`}
                </Tag>
            ))
        },
        {
            key: "cardio_levels",
            label: "Cardio Levels",
            children: mesocycleData?.cardioLevels?.map(level => (
                // @ts-ignore this is only supported in antd v6+ will leave it in for when we update
                <Tag key={level} color={cardioLevelTagColors[level]} variant="outlined">
                    {`${level}`}
                </Tag>
            ))
        }
    ]

    const isCycleCurrent = dayjs().isBetween(dayjs(mesocycleData?.cycle_start_date), dayjs(mesocycleData?.cycle_end_date), 'day', '[]');

    const cardStatus = isCycleCurrent ? "success" : "warning";
    const statusText = isCycleCurrent ? "Current" : "Pending";

    return (
        <Card
            variant="borderless"
            size="small"
            title={mesocycleData?.cycle_name && mesocycleData?.cycle_name.trim() !== "" ? mesocycleData.cycle_name : `Phase ${props.index}`}
            extra={<Badge status={cardStatus} text={statusText}/>}
            {...restProps}
        >
            <span
                style={{
                    width: '100%',
                    height: '100%',
                    padding: '0.5rem',
                }}
            >
                <Descriptions items={dataFields} />
            </span>
        </Card>
    )
}