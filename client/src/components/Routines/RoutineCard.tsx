import { Button, Card, Popconfirm, theme } from "antd";
import { FaTrashCan } from "react-icons/fa6";
import type { WorkoutRoutineEdit } from "../../types/types";

export interface RoutineCardProps extends React.ComponentProps<typeof Card> {
    onDeleteRoutine?: () => void;
    title: string;
    routine: WorkoutRoutineEdit;
    deleteButtonStyle?: React.CSSProperties;
}

export function RoutineCard(props: RoutineCardProps) {
    const { onDeleteRoutine, routine, deleteButtonStyle, style, title, ...cardProps } = props;
    const { token } = theme.useToken();

    return (
        <Card
            style={{
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                ...style
            }}
            styles={{
                body: {
                    height: '100%',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem',
                    backgroundColor: token.colorBgContainer,
                    borderColor: token.colorBorderSecondary,
                    transition: 'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease'
                }
            }}
            {...cardProps}
        >
            <div
                style={{
                    width: '100%',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                {onDeleteRoutine !== undefined &&
                <Popconfirm
                    title="Are you sure you want to delete this routine?"
                    onConfirm={(event) => {
                        event?.stopPropagation();
                        onDeleteRoutine();
                    }}
                >
                    <Button
                        aria-label={`Delete routine button`}
                        onMouseDown={(event) => {
                            event.stopPropagation();
                        }}
                        onDragStart={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                        }}
                        type="text"
                        icon={<FaTrashCan />}
                        style={{
                            position: 'absolute',
                            right: '-0.5rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '2.25rem',
                            height: '2.25rem',
                            padding: 0,
                            color: token.colorTextTertiary,
                            transition: 'opacity 0.2s ease, color 0.2s ease',
                            ...deleteButtonStyle
                        }}
                        className="routine-delete-button"
                    />
                </Popconfirm>}
                <span>{title}</span>
                <span style={{fontSize: '1rem'}}>{routine.routine_name}</span>
            </div>
        </Card>
    )
}