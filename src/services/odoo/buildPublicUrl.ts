export const buildPublicOdooUrl = (
    odooBaseUrl: string,
    relativeOrAbsolute: string | null | undefined
): string | null => {
    if (!relativeOrAbsolute) return null;

    if (/^https?:\/\//i.test(relativeOrAbsolute)) {
        return relativeOrAbsolute;
    }

    const base = new URL(odooBaseUrl).origin;
    const path = relativeOrAbsolute.startsWith("/")
        ? relativeOrAbsolute
        : `/${relativeOrAbsolute}`;

    return `${base}${path}`;
};
