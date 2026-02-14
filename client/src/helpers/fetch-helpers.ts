
export function createSearchParams(obj: Record<string, any>): URLSearchParams {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null) {     // adjust rules as needed
      params.append(key, String(value));             // .append if you ever need multi-value
    }
  }

  return params;
}