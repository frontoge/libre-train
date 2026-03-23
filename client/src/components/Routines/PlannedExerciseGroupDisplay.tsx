import type { PlannedExerciseGroup } from "../../../../shared/models";

export interface PlannedExerciseGroupProps {
    group: Omit<PlannedExerciseGroup, 'exercises' | 'routine_category'>;
    groupTitle?: string;
}

export function PlannedExerciseGroupDisplay(props: PlannedExerciseGroupProps) {
    const { group, groupTitle } = props;

    let title = groupTitle ?? "Group";

    const restAfterString = group.rest_after ? `${group.rest_after}s after group` : "";
    const restBetweenString = group.rest_between ? `${group.rest_between}s between each` : "";
    const restStrings = [restBetweenString, restAfterString].filter(Boolean);
    if (restStrings.length) {
        title += ` (Rest ${restStrings.join(", ")})`;
    }

    return (
        <div>
            {title}
        </div>
    )
}