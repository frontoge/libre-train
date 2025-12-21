import { Button } from "antd";


export default function PlanExercise() {
    return (
        <div>
            <span>Bench Press - 3x10, RPE 6, 4-2-1-1</span>
            <Button type="link">Edit</Button>
            <Button type="link" danger>Remove</Button>
        </div>
    )
}