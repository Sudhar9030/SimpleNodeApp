export type Expense = {
    userId : string,
    institutionName : string | undefined,
    expense: string | undefined,
    description?: string | undefined,
    amount: number,
    type?: string | undefined,
    category?: string | undefined,
    transactionDate? : Date | undefined,
    postedDate? : string | undefined,
    uploadId? : number | undefined
}