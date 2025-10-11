export const response = {
    success: (data?: any, message = "OK") => ({
        success: true,
        message,
        ...(data !== undefined && { data }),
    }),

    fail: (message = "Terjadi kesalahan", code?: number) => ({
        success: false,
        message,
        ...(code && { code }),
    }),

    notFound: (message = "Data tidak ditemukan") => ({
        success: false,
        message,
        code: 404,
    }),
};
