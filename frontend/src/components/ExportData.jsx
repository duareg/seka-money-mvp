import { useState, useMemo } from 'react'
import { FileSpreadsheet, FileText, Download, Loader2, Check, X, Calendar, ChevronDown } from 'lucide-react'
import { useCurrency } from '../currency'
import { useTranslation } from '../i18n'

// ============================================
// EXPORT DATA - PDF & EXCEL avec sélecteur de mois
// ============================================

// Fonction pour mettre en majuscule la première lettre
const capitalize = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

// Générer les 3 derniers mois
const getLastMonths = (language) => {
  const months = []
  const now = new Date()
  
  for (let i = 0; i < 3; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const monthName = date.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', { 
      month: 'long', 
      year: 'numeric' 
    })
    // Capitaliser le nom du mois
    const capitalizedName = monthName.charAt(0).toUpperCase() + monthName.slice(1)
    
    months.push({
      key: monthKey,
      label: capitalizedName,
      month: date.getMonth(),
      year: date.getFullYear()
    })
  }
  
  return months
}

export default function ExportData({ transactions, isDark, onClose }) {
  const { formatMoney, currentCurrency } = useCurrency()
  const { language } = useTranslation()
  const [exporting, setExporting] = useState(null)
  const [success, setSuccess] = useState(null)
  const [showMonthPicker, setShowMonthPicker] = useState(false)
  
  // Générer les mois disponibles
  const availableMonths = useMemo(() => getLastMonths(language), [language])
  const [selectedMonth, setSelectedMonth] = useState(availableMonths[0])

  // Filtrer les transactions par mois sélectionné
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => t.date?.startsWith(selectedMonth.key))
  }, [transactions, selectedMonth])

  const labels = {
    fr: {
      title: 'Exporter mes données',
      subtitle: 'Choisissez la période et le format',
      selectMonth: 'Période à exporter',
      excel: 'Excel (.xlsx)',
      excelDesc: 'Tableur avec vos transactions',
      pdf: 'PDF',
      pdfDesc: 'Rapport mensuel formaté',
      exporting: 'Export en cours...',
      success: 'Export réussi !',
      noData: 'Aucune transaction pour ce mois',
      cancel: 'Fermer',
      transactions: 'transactions',
      columns: {
        date: 'Date',
        type: 'Type',
        category: 'Catégorie',
        description: 'Description',
        amount: 'Montant',
        payment: 'Paiement',
        income: 'Revenu',
        expense: 'Dépense',
      }
    },
    en: {
      title: 'Export my data',
      subtitle: 'Choose period and format',
      selectMonth: 'Period to export',
      excel: 'Excel (.xlsx)',
      excelDesc: 'Spreadsheet with your transactions',
      pdf: 'PDF',
      pdfDesc: 'Formatted monthly report',
      exporting: 'Exporting...',
      success: 'Export successful!',
      noData: 'No transactions for this month',
      cancel: 'Close',
      transactions: 'transactions',
      columns: {
        date: 'Date',
        type: 'Type',
        category: 'Category',
        description: 'Description',
        amount: 'Amount',
        payment: 'Payment',
        income: 'Income',
        expense: 'Expense',
      }
    }
  }

  const t = labels[language] || labels.fr

  // ========== EXPORT EXCEL (CSV) ==========
  const exportExcel = async () => {
    if (filteredTransactions.length === 0) {
      alert(t.noData)
      return
    }

    setExporting('excel')
    setSuccess(null)

    try {
      const headers = [
        t.columns.date,
        t.columns.type,
        t.columns.category,
        t.columns.description,
        t.columns.amount,
        t.columns.payment
      ]

      const rows = filteredTransactions.map(tr => [
        tr.date,
        tr.type === 'income' ? t.columns.income : t.columns.expense,
        capitalize(tr.category),
        tr.description || '',
        tr.amount,
        tr.payment_method || 'cash'
      ])

      const BOM = '\uFEFF'
      const csvContent = BOM + [
        headers.join(';'),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(';'))
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `seka-money-${selectedMonth.key}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      setSuccess('excel')
      setTimeout(() => setSuccess(null), 2000)
    } catch (error) {
      console.error('Erreur export Excel:', error)
      alert('Erreur lors de l\'export')
    } finally {
      setExporting(null)
    }
  }

  // ========== EXPORT PDF ==========
  const exportPDF = async () => {
    if (filteredTransactions.length === 0) {
      alert(t.noData)
      return
    }

    setExporting('pdf')
    setSuccess(null)

    try {
      const totalIncome = filteredTransactions
        .filter(t => t.type === 'income')
        .reduce((s, t) => s + t.amount, 0)
      const totalExpense = filteredTransactions
        .filter(t => t.type === 'expense')
        .reduce((s, t) => s + t.amount, 0)
      const balance = totalIncome - totalExpense

      const byCategory = {}
      filteredTransactions.filter(t => t.type === 'expense').forEach(tr => {
        const catName = capitalize(tr.category)
        if (!byCategory[catName]) {
          byCategory[catName] = 0
        }
        byCategory[catName] += tr.amount
      })

      const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>SEKA Money - ${selectedMonth.label}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      padding: 40px;
      color: #1a1a1a;
      background: #fff;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid #0077B6;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .logo-icon {
      width: 50px;
      height: 50px;
      background: linear-gradient(135deg, #0077B6, #00B4D8);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 28px;
      font-weight: bold;
    }
    .logo-text {
      display: flex;
      flex-direction: column;
    }
    .logo-text .brand {
      font-size: 24px;
      font-weight: 800;
      color: #0077B6;
    }
    .logo-text .sub {
      font-size: 14px;
      color: #00B4D8;
      font-weight: 500;
    }
    .header-info {
      text-align: right;
    }
    .header-info h2 {
      font-size: 18px;
      color: #0077B6;
      margin-bottom: 4px;
    }
    .header-info p {
      font-size: 14px;
      color: #666;
    }
    .summary {
      display: flex;
      gap: 20px;
      margin-bottom: 30px;
    }
    .summary-card {
      flex: 1;
      padding: 20px;
      border-radius: 12px;
      text-align: center;
    }
    .summary-card.income {
      background: linear-gradient(135deg, #ecfdf5, #d1fae5);
      border: 1px solid #a7f3d0;
    }
    .summary-card.expense {
      background: linear-gradient(135deg, #fef2f2, #fee2e2);
      border: 1px solid #fecaca;
    }
    .summary-card.balance {
      background: linear-gradient(135deg, #eff6ff, #dbeafe);
      border: 1px solid #bfdbfe;
    }
    .summary-card h3 {
      font-size: 12px;
      color: #666;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .summary-card .amount {
      font-size: 24px;
      font-weight: 700;
    }
    .summary-card.income .amount { color: #059669; }
    .summary-card.expense .amount { color: #dc2626; }
    .summary-card.balance .amount { color: #2563eb; }
    .section {
      margin-bottom: 30px;
    }
    .section h2 {
      font-size: 16px;
      color: #333;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 2px solid #e5e7eb;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }
    th {
      background: #f3f4f6;
      padding: 12px 10px;
      text-align: left;
      font-weight: 600;
      color: #374151;
      border-bottom: 2px solid #e5e7eb;
    }
    td {
      padding: 10px;
      border-bottom: 1px solid #f3f4f6;
      color: #4b5563;
    }
    tr:hover { background: #f9fafb; }
    .amount-income { color: #059669; font-weight: 600; }
    .amount-expense { color: #dc2626; font-weight: 600; }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
    }
    .footer p {
      color: #999;
      font-size: 11px;
    }
    .footer .brand {
      color: #0077B6;
      font-weight: 600;
    }
    .categories {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }
    .category-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 15px;
      background: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid #0077B6;
    }
    .category-item span:first-child {
      font-weight: 500;
      color: #333;
    }
    @media print {
      body { padding: 20px; }
      .summary { flex-wrap: wrap; }
      .summary-card { min-width: 150px; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">
      <div class="logo-icon">S</div>
      <div class="logo-text">
        <span class="brand">SEKA Money</span>
        <span class="sub">Gérez votre argent simplement</span>
      </div>
    </div>
    <div class="header-info">
      <h2>${selectedMonth.label}</h2>
      <p>${language === 'fr' ? 'Rapport Financier' : 'Financial Report'}</p>
    </div>
  </div>

  <div class="summary">
    <div class="summary-card income">
      <h3>${language === 'fr' ? 'Revenus' : 'Income'}</h3>
      <div class="amount">+${formatMoney(totalIncome)}</div>
    </div>
    <div class="summary-card expense">
      <h3>${language === 'fr' ? 'Dépenses' : 'Expenses'}</h3>
      <div class="amount">-${formatMoney(totalExpense)}</div>
    </div>
    <div class="summary-card balance">
      <h3>${language === 'fr' ? 'Solde' : 'Balance'}</h3>
      <div class="amount">${balance >= 0 ? '+' : ''}${formatMoney(balance)}</div>
    </div>
  </div>

  ${Object.keys(byCategory).length > 0 ? `
  <div class="section">
    <h2>${language === 'fr' ? 'Dépenses par catégorie' : 'Expenses by category'}</h2>
    <div class="categories">
      ${Object.entries(byCategory)
        .sort((a, b) => b[1] - a[1])
        .map(([cat, amount]) => `
          <div class="category-item">
            <span>${cat}</span>
            <span class="amount-expense">-${formatMoney(amount)}</span>
          </div>
        `).join('')}
    </div>
  </div>
  ` : ''}

  <div class="section">
    <h2>${language === 'fr' ? 'Détail des transactions' : 'Transaction details'} (${filteredTransactions.length})</h2>
    <table>
      <thead>
        <tr>
          <th>${t.columns.date}</th>
          <th>${t.columns.category}</th>
          <th>${t.columns.description}</th>
          <th style="text-align: right">${t.columns.amount}</th>
        </tr>
      </thead>
      <tbody>
        ${filteredTransactions.slice(0, 50).map(tr => `
          <tr>
            <td>${new Date(tr.date).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')}</td>
            <td>${capitalize(tr.category)}</td>
            <td>${tr.description || '-'}</td>
            <td style="text-align: right" class="${tr.type === 'income' ? 'amount-income' : 'amount-expense'}">
              ${tr.type === 'income' ? '+' : '-'}${formatMoney(tr.amount)}
            </td>
          </tr>
        `).join('')}
        ${filteredTransactions.length > 50 ? `
          <tr>
            <td colspan="4" style="text-align: center; color: #999; font-style: italic;">
              ... ${language === 'fr' ? 'et' : 'and'} ${filteredTransactions.length - 50} ${language === 'fr' ? 'autres transactions' : 'more transactions'}
            </td>
          </tr>
        ` : ''}
      </tbody>
    </table>
  </div>

  <div class="footer">
    <p>${language === 'fr' ? 'Généré par' : 'Generated by'} <span class="brand">SEKA Money</span></p>
    <p style="margin-top: 5px;">${new Date().toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US')}</p>
  </div>
</body>
</html>
      `

      const printWindow = window.open('', '_blank')
      printWindow.document.write(html)
      printWindow.document.close()
      
      printWindow.onload = () => {
        printWindow.print()
      }

      setSuccess('pdf')
      setTimeout(() => setSuccess(null), 2000)
    } catch (error) {
      console.error('Erreur export PDF:', error)
      alert('Erreur lors de l\'export')
    } finally {
      setExporting(null)
    }
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div 
        className={`w-full max-w-sm rounded-2xl overflow-hidden ${isDark ? 'bg-seka-card' : 'bg-white'}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-5 py-4 border-b flex items-center justify-between ${isDark ? 'border-seka-border' : 'border-gray-200'}`}>
          <div>
            <h3 className={`font-semibold text-lg ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>
              {t.title}
            </h3>
            <p className={`text-xs ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>
              {t.subtitle}
            </p>
          </div>
          <button onClick={onClose} className={`p-2 rounded-lg ${isDark ? 'hover:bg-seka-darker' : 'hover:bg-gray-100'}`}>
            <X className={`w-5 h-5 ${isDark ? 'text-seka-text-muted' : 'text-gray-400'}`} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Sélecteur de mois */}
          <div>
            <label className={`block text-xs font-medium mb-2 ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>
              {t.selectMonth}
            </label>
            <div className="relative">
              <button
                onClick={() => setShowMonthPicker(!showMonthPicker)}
                className={`w-full p-3 rounded-xl flex items-center justify-between ${
                  isDark 
                    ? 'bg-seka-darker border border-seka-border text-seka-text' 
                    : 'bg-gray-50 border border-gray-200 text-gray-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Calendar className={`w-5 h-5 ${isDark ? 'text-seka-green' : 'text-green-600'}`} />
                  <span className="font-medium">{selectedMonth.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    isDark ? 'bg-seka-green/20 text-seka-green' : 'bg-green-100 text-green-700'
                  }`}>
                    {filteredTransactions.length} {t.transactions}
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showMonthPicker ? 'rotate-180' : ''} ${isDark ? 'text-seka-text-muted' : 'text-gray-400'}`} />
                </div>
              </button>

              {/* Dropdown des mois */}
              {showMonthPicker && (
                <div className={`absolute top-full left-0 right-0 mt-2 rounded-xl overflow-hidden shadow-lg z-10 ${
                  isDark ? 'bg-seka-darker border border-seka-border' : 'bg-white border border-gray-200'
                }`}>
                  {availableMonths.map((month) => {
                    const monthTransactions = transactions.filter(t => t.date?.startsWith(month.key))
                    const isSelected = month.key === selectedMonth.key
                    
                    return (
                      <button
                        key={month.key}
                        onClick={() => {
                          setSelectedMonth(month)
                          setShowMonthPicker(false)
                        }}
                        className={`w-full p-3 flex items-center justify-between transition-colors ${
                          isSelected 
                            ? isDark ? 'bg-seka-green/20' : 'bg-green-50'
                            : isDark ? 'hover:bg-seka-card' : 'hover:bg-gray-50'
                        }`}
                      >
                        <span className={`font-medium ${
                          isSelected 
                            ? 'text-seka-green' 
                            : isDark ? 'text-seka-text' : 'text-gray-900'
                        }`}>
                          {month.label}
                        </span>
                        <span className={`text-xs ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>
                          {monthTransactions.length} {t.transactions}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Boutons d'export */}
          <div className="space-y-3">
            {/* Excel */}
            <button
              onClick={exportExcel}
              disabled={exporting !== null || filteredTransactions.length === 0}
              className={`w-full p-4 rounded-xl flex items-center gap-4 transition-all ${
                filteredTransactions.length === 0
                  ? isDark ? 'bg-seka-darker/50 opacity-50' : 'bg-gray-100 opacity-50'
                  : success === 'excel'
                    ? 'bg-seka-green/20 border-2 border-seka-green'
                    : isDark 
                      ? 'bg-seka-darker hover:bg-seka-darker/70 border border-seka-border' 
                      : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                success === 'excel' ? 'bg-seka-green' : 'bg-green-500/20'
              }`}>
                {exporting === 'excel' ? (
                  <Loader2 className="w-6 h-6 text-green-500 animate-spin" />
                ) : success === 'excel' ? (
                  <Check className="w-6 h-6 text-seka-darker" />
                ) : (
                  <FileSpreadsheet className="w-6 h-6 text-green-500" />
                )}
              </div>
              <div className="flex-1 text-left">
                <p className={`font-medium ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>
                  {t.excel}
                </p>
                <p className={`text-xs ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>
                  {exporting === 'excel' ? t.exporting : success === 'excel' ? t.success : t.excelDesc}
                </p>
              </div>
              <Download className={`w-5 h-5 ${isDark ? 'text-seka-text-muted' : 'text-gray-400'}`} />
            </button>

            {/* PDF */}
            <button
              onClick={exportPDF}
              disabled={exporting !== null || filteredTransactions.length === 0}
              className={`w-full p-4 rounded-xl flex items-center gap-4 transition-all ${
                filteredTransactions.length === 0
                  ? isDark ? 'bg-seka-darker/50 opacity-50' : 'bg-gray-100 opacity-50'
                  : success === 'pdf'
                    ? 'bg-seka-green/20 border-2 border-seka-green'
                    : isDark 
                      ? 'bg-seka-darker hover:bg-seka-darker/70 border border-seka-border' 
                      : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                success === 'pdf' ? 'bg-seka-green' : 'bg-red-500/20'
              }`}>
                {exporting === 'pdf' ? (
                  <Loader2 className="w-6 h-6 text-red-500 animate-spin" />
                ) : success === 'pdf' ? (
                  <Check className="w-6 h-6 text-seka-darker" />
                ) : (
                  <FileText className="w-6 h-6 text-red-500" />
                )}
              </div>
              <div className="flex-1 text-left">
                <p className={`font-medium ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>
                  {t.pdf}
                </p>
                <p className={`text-xs ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>
                  {exporting === 'pdf' ? t.exporting : success === 'pdf' ? t.success : t.pdfDesc}
                </p>
              </div>
              <Download className={`w-5 h-5 ${isDark ? 'text-seka-text-muted' : 'text-gray-400'}`} />
            </button>
          </div>
        </div>

        {/* Info */}
        <div className={`px-4 pb-4`}>
          <p className={`text-xs text-center ${isDark ? 'text-seka-text-muted' : 'text-gray-400'}`}>
            {filteredTransactions.length} {t.transactions} • {selectedMonth.label} • {currentCurrency.labelShort}
          </p>
        </div>
      </div>
    </div>
  )
}
