export type Expense = {
    userId : string,
    institutionName : string | undefined,
    expense: string | undefined,
    description?: string | undefined,
    amount: number,
    type?: string | undefined,
    category?: string | undefined,
    transactionDate? : string | undefined,
    postedDate? : string | undefined
}