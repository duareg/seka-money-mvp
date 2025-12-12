import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { transactionsApi, objectivesApi, loansApi, investmentsApi, depositsApi } from './api'

// ========== CONFIG ==========
export const queryConfig = {
  staleTime: 60 * 1000, // 1 minute - données considérées fraîches
  gcTime: 30 * 60 * 1000, // 30 minutes - garde en cache
  refetchOnWindowFocus: false, // pas de refetch quand on revient sur l'app
  retry: 1, // 1 seul retry en cas d'erreur
}

// ========== TRANSACTIONS HOOKS ==========
export function useTransactions() {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: () => transactionsApi.getAll(),
    ...queryConfig,
  })
}

export function useTransaction(id) {
  return useQuery({
    queryKey: ['transactions', id],
    queryFn: () => transactionsApi.getById(id),
    enabled: !!id,
    ...queryConfig,
  })
}

export function useCreateTransaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (transaction) => transactionsApi.create(transaction),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, updates }) => transactionsApi.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => transactionsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}

// ========== OBJECTIVES HOOKS ==========
export function useObjectives() {
  return useQuery({
    queryKey: ['objectives'],
    queryFn: () => objectivesApi.getAll(),
    ...queryConfig,
  })
}

export function useCreateObjective() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (objective) => objectivesApi.create(objective),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objectives'] })
    },
  })
}

export function useUpdateObjective() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, updates }) => objectivesApi.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objectives'] })
    },
  })
}

export function useDeleteObjective() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => objectivesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objectives'] })
    },
  })
}

// ========== DEPOSITS HOOKS ==========
export function useDeposits(objectiveId) {
  return useQuery({
    queryKey: ['deposits', objectiveId],
    queryFn: () => depositsApi.getByObjective(objectiveId),
    enabled: !!objectiveId,
    ...queryConfig,
  })
}

export function useCreateDeposit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (deposit) => depositsApi.create(deposit),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['deposits', variables.objective_id] })
      queryClient.invalidateQueries({ queryKey: ['objectives'] })
    },
  })
}

// ========== LOANS HOOKS ==========
export function useLoans() {
  return useQuery({
    queryKey: ['loans'],
    queryFn: () => loansApi.getAll(),
    ...queryConfig,
  })
}

export function useCreateLoan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (loan) => loansApi.create(loan),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] })
    },
  })
}

export function useUpdateLoan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, updates }) => loansApi.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] })
    },
  })
}

export function useDeleteLoan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => loansApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] })
    },
  })
}

export function useLoanPayments(loanId) {
  return useQuery({
    queryKey: ['loanPayments', loanId],
    queryFn: () => loansApi.getPayments(loanId),
    enabled: !!loanId,
    ...queryConfig,
  })
}

export function useAddLoanPayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ loanId, payment }) => loansApi.addPayment(loanId, payment),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['loanPayments', variables.loanId] })
      queryClient.invalidateQueries({ queryKey: ['loans'] })
    },
  })
}

// ========== INVESTMENTS HOOKS ==========
export function useInvestments() {
  return useQuery({
    queryKey: ['investments'],
    queryFn: () => investmentsApi.getAll(),
    ...queryConfig,
  })
}

export function useCreateInvestment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (investment) => investmentsApi.create(investment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments'] })
    },
  })
}

export function useDeleteInvestment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => investmentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments'] })
    },
  })
}
