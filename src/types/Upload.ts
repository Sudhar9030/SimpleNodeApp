export type Upload = {
    seqNo: number | undefined,
    accountName: string | undefined,
    fileName: string | undefined,
    statementStartDate?: Date | undefined,
    statementEndDate?: Date | undefined,
    uploadTime?: Date | undefined
    userId: string | undefined
}