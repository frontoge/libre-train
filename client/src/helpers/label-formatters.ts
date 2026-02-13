
export const formatClientFullName = (firstName?: string, lastName?: string) => {
    return `${firstName ?? ""} ${lastName ?? ""}`.trim();
}