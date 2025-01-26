export async function authFetch(
    url: string,
    options: RequestInit = {}
): Promise<any> {
    const token = localStorage.getItem("token");

    // Merge our default headers with user-provided ones
    const headers = {
        ...options.headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const response = await fetch(url, { ...options, headers });


    return response;
}
