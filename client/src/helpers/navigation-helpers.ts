
function getNavigationUrlFromNavKey(navKey: string): string {

    switch (navKey) {
        // Index pages
        case 'dashboard':
        case 'client_overview':
        case 'training_plan_manage':
        case 'assessment_manage':
        case 'exercise_manage':
            return '';
        case 'clientsMenu':
            return 'clients';
        case 'training_plan_new':
        case 'client_new':
        case 'assessment_new':
            return 'create';
        case 'exercisesMenu':
            return 'exercises';
        case 'trainingMenu':
            return 'training';
        case 'assessmentsMenu':
            return 'assessments';
        case 'training_plan_snapshot':
            return 'view';
        default:
            return 'not-found';
    }
}

export function getNavigationUrl(keyPath: string[]): string {
    const reversedKeyPath = keyPath.toReversed();
    return reversedKeyPath.reduce((acc: string, current: string) => {
        return acc + "/" + getNavigationUrlFromNavKey(current)
    }, '')
}