import { NutritionBar } from "./NutritionBar"

export function NutritionSummary() {
    return (
        <div className='daily-nutrition' style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'end',
            alignItems: 'start',
            width: '100%',
        }}>
            <h3 style={{
                alignSelf: 'center',
                fontSize: '1.5rem',
                marginTop: '0',
            }}>Nutrition</h3>
            <NutritionBar label="Calories" value={2876} maxValue={3000} />
            <NutritionBar label="Protein" value={200} maxValue={250} color='orange'/>
            <NutritionBar label="Carbs" value={300} maxValue={350} color='green'/>
            <NutritionBar label="Fats" value={100} maxValue={150} color='purple'/>
        </div>
    )
}