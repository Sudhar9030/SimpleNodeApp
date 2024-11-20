export type ApiResponse<T> = {
    data?: T | undefined | null,
    message?: string | undefined | null
}