import { Fragment, useRef, useState } from "react";
import { Button, Card, theme } from "antd";
import { IoMdAddCircleOutline } from "react-icons/io";
import "../../styles/MicrocycleRoutinePicker.css";
import type { WorkoutRoutineEdit } from "../../types/types";
import { FaTrashCan } from "react-icons/fa6";


export interface MicrocycleRoutinePickerProps extends React.HTMLProps<HTMLDivElement> {
    onNewRoutine?: () => void;
    onSelectRoutine?: (routineIndex: number) => void;
    onDeleteRoutine?: (routineIndex: number) => void;
    onReorder?: (sourceIndex: number, targetIndex: number) => void;
    selectedRoutineIndex?: number;
    routines?: WorkoutRoutineEdit[];
}

export function MicrocycleRoutinePicker(props: MicrocycleRoutinePickerProps) {
    const { onNewRoutine, onSelectRoutine, onDeleteRoutine, onReorder, routines, onWheel, selectedRoutineIndex, style, ...divProps } = props;
    const [isAddCardHovered, setIsAddCardHovered] = useState(false);
    const { token } = theme.useToken();
    const maxVisibleRoutineCards = 5;
    const totalCards = (routines?.length ?? 0) + 1;
    const shouldScrollHorizontally = totalCards > maxVisibleRoutineCards;
    const cardWidth = `calc((100% - ${(maxVisibleRoutineCards - 1)}rem) / ${maxVisibleRoutineCards})`;
    const containerRef = useRef<HTMLDivElement | null>(null);
    const routinesList = routines ?? [];

    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dropPreviewIndex, setDropPreviewIndex] = useState<number | null>(null);
    const [hoveredRoutineIndex, setHoveredRoutineIndex] = useState<number | null>(null);

    const pointerXRef = useRef<number>(0);
    const scrollRafRef = useRef<number | null>(null);

    const startAutoScroll = () => {
        const EDGE_THRESHOLD = 80;
        const MAX_SCROLL_SPEED = 20;

        const tick = () => {
            const container = containerRef.current;
            if (!container) return;

            const bounds = container.getBoundingClientRect();
            const distFromLeft = pointerXRef.current - bounds.left;
            const distFromRight = bounds.right - pointerXRef.current;

            if (distFromLeft < EDGE_THRESHOLD) {
                const intensity = (EDGE_THRESHOLD - distFromLeft) / EDGE_THRESHOLD;
                container.scrollLeft -= Math.ceil(MAX_SCROLL_SPEED * intensity);
            } else if (distFromRight < EDGE_THRESHOLD) {
                const intensity = (EDGE_THRESHOLD - distFromRight) / EDGE_THRESHOLD;
                container.scrollLeft += Math.ceil(MAX_SCROLL_SPEED * intensity);
            }

            scrollRafRef.current = requestAnimationFrame(tick);
        };

        scrollRafRef.current = requestAnimationFrame(tick);
    };

    const stopAutoScroll = () => {
        if (scrollRafRef.current !== null) {
            cancelAnimationFrame(scrollRafRef.current);
            scrollRafRef.current = null;
        }
    };

    const getDropIndexFromPointer = (event: React.DragEvent<HTMLDivElement>, cardIndex: number) => {
        const bounds = event.currentTarget.getBoundingClientRect();
        return event.clientX >= bounds.left + bounds.width / 2 ? cardIndex + 1 : cardIndex;
    };

    const handleDrop = (_sourceIndex: number) => {
        const _targetIndex = dropPreviewIndex;
        if (_targetIndex === null) {
            setDraggedIndex(null);
            setDropPreviewIndex(null);
            stopAutoScroll();
            return;
        }

        if (onReorder) {
            onReorder(_sourceIndex, _targetIndex);
        }

        setDraggedIndex(null);
        setDropPreviewIndex(null);
        stopAutoScroll();
    };

    const handleWheel: React.WheelEventHandler<HTMLDivElement> = (event) => {
        const container = containerRef.current;
        if (!container) {
            onWheel?.(event);
            return;
        }

        const canScrollHorizontally = container.scrollWidth > container.clientWidth;
        if (canScrollHorizontally && Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
            container.scrollLeft += event.deltaY;
        }

        onWheel?.(event);
    };

    return (
        <div
            ref={containerRef}
            {...divProps}
            className="microcycle-routine-picker-scroll"
            onWheel={handleWheel}
            onDragOver={(event) => { pointerXRef.current = event.clientX; }}
            style={{
                display: 'flex',
                gap: '1rem',
                alignItems: 'center',
                justifyContent: shouldScrollHorizontally ? 'flex-start' : 'center',
                overflowX: 'auto',
                overflowY: 'hidden',
                scrollbarGutter: 'stable',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                ...style
            } as React.CSSProperties}
        >
            {routinesList.map((routine, index) => (
                <Fragment key={index}>
                    {dropPreviewIndex === index && draggedIndex !== null && (
                        <Card
                            style={{
                                flex: `0 0 ${cardWidth}`,
                                height: '100%',
                                overflow: 'hidden',
                                border: `2px dashed ${token.colorBorder}`,
                                backgroundColor: token.colorFillQuaternary
                            }}
                            styles={{ body: { height: '100%' } }}
                        />
                    )}
                    <div
                        draggable
                        onMouseEnter={() => setHoveredRoutineIndex(index)}
                        onMouseLeave={() => setHoveredRoutineIndex(prev => (prev === index ? null : prev))}
                        onDragStart={(event) => {
                            event.dataTransfer.effectAllowed = 'move';
                            setDraggedIndex(index);
                            startAutoScroll();
                        }}
                        onDragEnd={() => {
                            handleDrop(draggedIndex!);
                            setDraggedIndex(null);
                            setDropPreviewIndex(null);
                            stopAutoScroll();
                        }}
                        onDragOver={(event) => {
                            if (draggedIndex === null) return;
                            event.preventDefault();
                            setDropPreviewIndex(getDropIndexFromPointer(event, index));
                        }}
                        style={{ flex: `0 0 ${cardWidth}`, height: '100%' }}
                    >
                        <Card
                            style={{
                                width: '100%',
                                height: '100%',
                                overflow: 'hidden'
                            }}
                            onClick={() => onSelectRoutine && onSelectRoutine(index)}
                            styles={{
                                body: {
                                    height: '100%',
                                    textAlign: 'center',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.25rem',
                                    backgroundColor: selectedRoutineIndex === index ? token.colorFillSecondary : token.colorBgContainer,
                                    borderColor: selectedRoutineIndex === index ? token.colorBorder : token.colorBorderSecondary,
                                    transition: 'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease'
                                }
                            }}
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
                                <Button
                                    aria-label={`Delete routine ${index + 1}`}
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        onDeleteRoutine?.(index);
                                    }}
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
                                        opacity: hoveredRoutineIndex === index ? 1 : 0,
                                        pointerEvents: hoveredRoutineIndex === index ? 'auto' : 'none',
                                        transition: 'opacity 0.2s ease, color 0.2s ease'
                                    }}
                                    className="routine-delete-button"
                                />
                                <span>Day {index + 1}</span>
                                <span style={{fontSize: '1rem'}}>{routine.routine_name}</span>
                            </div>
                        </Card>
                    </div>
                </Fragment>
            ))}
            {dropPreviewIndex === routinesList.length && draggedIndex !== null && (
                <Card
                    style={{
                        flex: `0 0 ${cardWidth}`,
                        height: '100%',
                        overflow: 'hidden',
                        border: `2px dashed ${token.colorBorder}`,
                        backgroundColor: token.colorFillQuaternary
                    }}
                    styles={{ body: { height: '100%' } }}
                />
            )}
            <div
                role="button"
                tabIndex={0}
                aria-label="Create a new routine"
                onClick={onNewRoutine}
                onMouseEnter={() => setIsAddCardHovered(true)}
                onMouseLeave={() => setIsAddCardHovered(false)}
                style={{
                    flex: `0 0 ${cardWidth}`,
                    height: '100%',
                    cursor: 'pointer',
                    outline: 'none'
                }}
            >
                <Card
                    hoverable
                    style={{
                        width: '100%',
                        height: '100%',
                        overflow: 'hidden',
                        backgroundColor: isAddCardHovered ? token.colorFillSecondary : token.colorBgContainer,
                        borderColor: isAddCardHovered ? token.colorBorder : token.colorBorderSecondary,
                        color: token.colorTextTertiary,
                        transition: 'background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease'
                    }}
                    styles={{
                        body: {
                            height: '100%',
                            padding: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }
                    }}
                >
                    <IoMdAddCircleOutline style={{ width: '100%', height: '100%' }} />
                </Card>
            </div>
            
        </div>
    )
}