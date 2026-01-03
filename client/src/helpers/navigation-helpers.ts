
function getNavigationUrlFromNavKey(navKey: string): string {

    switch (navKey) {
        // Index pages
        case 'dashboard':
        case 'client_overview':
        case 'plan_manage':
            return '';
        case 'clientsMenu':
            return 'clients';
        case 'plan_new':
        case 'client_new':
        case 'exercise_new':
            return 'create';
        case 'exercisesMenu':
            return 'exercises';
        case 'plansMenu':
            return 'plans';
        default:
            return '/not-found';
    }
}

export function getNavigationUrl(keyPath: string[]): string {
    const reversedKeyPath = keyPath.toReversed();
    return reversedKeyPath.reduce((acc: string, current: string) => {
        return acc + "/" + getNavigationUrlFromNavKey(current)
    }, '')
}