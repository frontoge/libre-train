
function getNavigationUrlFromNavKey(navKey: string): string {

    switch (navKey) {
        case 'dashboard':
            return '';
        case 'clientsMenu':
            return 'clients';
        case 'client_overview':
            return '';
        case 'client_new':
            return 'create';
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