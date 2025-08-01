
export function undefinedIfNull<T>(value: T | null | undefined): T | undefined {
    return value === null || value === undefined ? undefined : value;
}