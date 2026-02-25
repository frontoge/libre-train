import { Badge, Card, Descriptions } from "antd";
import type { Microcycle } from "../../../../shared/models";
import dayjs from "../../config/dayjs";

export interface MicrocycleCardProps extends React.ComponentProps<typeof Card> {
    microcycleData?: Microcycle;
    index?: number;
}
    
export function MicrocycleCard(props: MicrocycleCardProps) {
    const startDate = props.microcycleData?.cycle_start_date ? dayjs.tz(props.microcycleData.cycle_start_date).format('MM/DD/YYYY') : '';
    const endDate = props.microcycleData?.cycle_end_date ? dayjs.tz(props.microcycleData.cycle_end_date).format('MM/DD/YYYY') : '';
    const dateString = startDate !== endDate ? `${startDate} - ${endDate}` : startDate;

    const currentDate = dayjs();
    const isCycleCurrent = currentDate.isBetween(dayjs(props.microcycleData?.cycle_start_date), dayjs(props.microcycleData?.cycle_end_date), 'day', '[]');
    const cardStatus = isCycleCurrent ? "success" : currentDate.isBefore(dayjs(props.microcycleData?.cycle_start_date)) ? "warning" : "default";
    const statusText = isCycleCurrent ? "Current" : currentDate.isBefore(dayjs(props.microcycleData?.cycle_start_date)) ? "Pending" : "Completed";

    const cardData = [
        {
            label: "Dates",
            children: dateString,
        },
        {
            label: "Notes",
            children: "Very long text that will wrap or mess up the user interface, if not properly handled. we should find a better way to test than doing this over and over again. This is why i hate frontend!",
        }
    ]

    return (
        <Card
            variant="borderless"
            size="small"
            title={props.microcycleData?.cycle_name && props.microcycleData?.cycle_name.trim() !== "" ? props.microcycleData.cycle_name : `Phase ${props.index}`}
            extra={<Badge status={cardStatus} text={statusText}/>}
            {...props}
        >
            <span
                style={{
                    width: "100%",
                    padding: '0.5rem'
                }}
            >
               <Descriptions size="small" column={1} items={cardData} bordered />
            </span>
        </Card>
    )
}