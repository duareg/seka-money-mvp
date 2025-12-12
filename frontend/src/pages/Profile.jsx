import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, User, Bell, Moon, Sun, Shield, HelpCircle, LogOut,
  ChevronRight, ChevronDown, Mail, Camera, Crown, Download,
  Globe, Trash2, Info, ExternalLink, Check, Link2, RefreshCw,
  Phone, Lock, Eye, EyeOff, Save, X, AlertTriangle, Calendar,
  MapPin, Users
} from 'lucide-react'
import { useAuth, useTheme } from '../App'
import { useLanguage, AVAILABLE_LANGUAGES } from '../i18n'
import { useCurrency } from '../currency/CurrencyContext'
import CurrencySelector from '../components/CurrencySelector'
import ExportData from '../components/ExportData'
import { transactionsApi } from '../utils/api'
import { useNotificationPreferences } from '../utils/useNotifications'
import { supabase } from '../lib/supabase'

// Comptes Mobile Money disponibles
const MOBILE_ACCOUNTS = [
  { id: 'mtn', name: 'MTN MoMo', color: '#FFCC00', textColor: '#000' },
  { id: 'moov', name: 'Moov Money', color: '#0066B3', textColor: '#fff' },
  { id: 'wave', name: 'Wave', color: '#1DC3E3', textColor: '#fff' },
  { id: 'celtiis', name: 'Celtiis Cash', color: '#E31937', textColor: '#fff' },
]

// Liste des pays avec devise associée
const COUNTRIES = [
  { code: 'BJ', name: 'Bénin', flag: '🇧🇯', currency: 'FCFA' },
  { code: 'TG', name: 'Togo', flag: '🇹🇬', currency: 'FCFA' },
  { code: 'CI', name: 'Côte d\'Ivoire', flag: '🇨🇮', currency: 'FCFA' },
  { code: 'SN', name: 'Sénégal', flag: '🇸🇳', currency: 'FCFA' },
  { code: 'BF', name: 'Burkina Faso', flag: '🇧🇫', currency: 'FCFA' },
  { code: 'ML', name: 'Mali', flag: '🇲🇱', currency: 'FCFA' },
  { code: 'NE', name: 'Niger', flag: '🇳🇪', currency: 'FCFA' },
  { code: 'GN', name: 'Guinée', flag: '🇬🇳', currency: 'FCFA' },
  { code: 'CM', name: 'Cameroun', flag: '🇨🇲', currency: 'FCFA' },
  { code: 'GA', name: 'Gabon', flag: '🇬🇦', currency: 'FCFA' },
  { code: 'CG', name: 'Congo', flag: '🇨🇬', currency: 'FCFA' },
  { code: 'CD', name: 'RD Congo', flag: '🇨🇩', currency: 'FCFA' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬', currency: 'NGN' },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭', currency: 'GHS' },
  { code: 'FR', name: 'France', flag: '🇫🇷', currency: 'EUR' },
  { code: 'US', name: 'États-Unis', flag: '🇺🇸', currency: 'USD' },
  { code: 'OTHER', name: 'Autre', flag: '🌍', currency: null },
]

// Options de sexe
const GENDER_OPTIONS = [
  { value: 'male', labelFr: 'Homme', labelEn: 'Male' },
  { value: 'female', labelFr: 'Femme', labelEn: 'Female' },
]

export default function Profile() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const { t, language, setLanguage } = useLanguage()
  const { setCurrency } = useCurrency()
  const fileInputRef = useRef(null)

  const [activeSection, setActiveSection] = useState(null)
  const [showLinkedAccounts, setShowLinkedAccounts] = useState(false)
  const [showLanguageModal, setShowLanguageModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showCountryPicker, setShowCountryPicker] = useState(false)
  const [showGenderPicker, setShowGenderPicker] = useState(false)
  const [exportTransactions, setExportTransactions] = useState([])
  const [tempLanguage, setTempLanguage] = useState(language)
  
  // Avatar state
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  
  // Personal info state
  const [personalInfo, setPersonalInfo] = useState({
    firstName: '',
    lastName: '',
    birthDate: '',
    gender: '',
    country: 'BJ'
  })
  const [savingPersonal, setSavingPersonal] = useState(false)
  
  // Email/Phone modification state
  const [editingEmail, setEditingEmail] = useState(false)
  const [editingPhone, setEditingPhone] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [sendingCode, setSendingCode] = useState(false)
  const [verifying, setVerifying] = useState(false)
  
  // Password state
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [passwordStep, setPasswordStep] = useState(1)
  const [currentPasswordVerified, setCurrentPasswordVerified] = useState(false)
  const [verifyingCurrent, setVerifyingCurrent] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  
  // Delete account state
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)

  // Notifications
  const { preferences: notifications, updatePreferences, loading: notifLoading } = useNotificationPreferences(user?.id)

  // Charger les infos utilisateur
  useEffect(() => {
    if (user) {
      const metadata = user.user_metadata || {}
      setPersonalInfo({
        firstName: metadata.firstName || metadata.name?.split(' ')[0] || '',
        lastName: metadata.lastName || metadata.name?.split(' ').slice(1).join(' ') || '',
        birthDate: metadata.birthDate || '',
        gender: metadata.gender || '',
        country: metadata.country || 'BJ'
      })
      setAvatarUrl(metadata.avatarUrl || null)
      setNewEmail(user.email || '')
      setNewPhone(metadata.phone || '')
    }
  }, [user])

  // Upload avatar
  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Vérifier le type
    if (!file.type.startsWith('image/')) {
      alert(language === 'fr' ? 'Veuillez sélectionner une image' : 'Please select an image')
      return
    }

    // Vérifier la taille (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert(language === 'fr' ? 'L\'image ne doit pas dépasser 2MB' : 'Image must be less than 2MB')
      return
    }

    setUploadingAvatar(true)
    try {
      // Créer un nom unique
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      // Upload vers Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) {
        // Si le bucket n'existe pas, on stocke en base64
        const reader = new FileReader()
        reader.onload = async (event) => {
          const base64 = event.target.result
          const { error } = await supabase.auth.updateUser({
            data: { avatarUrl: base64 }
          })
          if (!error) {
            setAvatarUrl(base64)
          }
        }
        reader.readAsDataURL(file)
      } else {
        // Obtenir l'URL publique
        const { data } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath)

        // Mettre à jour le profil
        await supabase.auth.updateUser({
          data: { avatarUrl: data.publicUrl }
        })
        setAvatarUrl(data.publicUrl)
      }
    } catch (error) {
      console.error('Erreur upload avatar:', error)
      alert(language === 'fr' ? 'Erreur lors de l\'upload' : 'Upload error')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleLogout = async () => {
    if (confirm(t('profile.logoutConfirm') || 'Voulez-vous vraiment vous déconnecter ?')) {
      await logout()
      navigate('/login')
    }
  }

  const openExportModal = async () => {
    try {
      const data = await transactionsApi.getAll()
      setExportTransactions(data || [])
      setShowExportModal(true)
    } catch (e) {
      console.error('Erreur chargement transactions:', e)
      setExportTransactions([])
      setShowExportModal(true)
    }
  }

  const openLanguageModal = () => {
    setTempLanguage(language)
    setShowLanguageModal(true)
  }

  const confirmLanguage = () => {
    setLanguage(tempLanguage)
    setShowLanguageModal(false)
  }

  const cancelLanguage = () => {
    setTempLanguage(language)
    setShowLanguageModal(false)
  }

  // Quand le pays change, mettre à jour la devise automatiquement
  const handleCountryChange = (countryCode) => {
    const country = COUNTRIES.find(c => c.code === countryCode)
    setPersonalInfo({ ...personalInfo, country: countryCode })
    
    // Mettre à jour la devise si le pays a une devise définie
    if (country?.currency) {
      setCurrency(country.currency)
    }
    
    setShowCountryPicker(false)
  }

  // Sauvegarder les infos personnelles
  const savePersonalInfo = async () => {
    setSavingPersonal(true)
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          firstName: personalInfo.firstName,
          lastName: personalInfo.lastName,
          name: `${personalInfo.firstName} ${personalInfo.lastName}`.trim(),
          birthDate: personalInfo.birthDate,
          gender: personalInfo.gender,
          country: personalInfo.country
        }
      })
      if (error) throw error
      setActiveSection(null)
    } catch (error) {
      console.error('Erreur sauvegarde:', error)
      alert(language === 'fr' ? 'Erreur lors de la sauvegarde' : 'Error saving')
    } finally {
      setSavingPersonal(false)
    }
  }

  // Envoyer code de vérification
  const sendVerificationCode = async (type) => {
    setSendingCode(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      setCodeSent(true)
      alert(language === 'fr' 
        ? `Code envoyé par ${type === 'email' ? 'email' : 'SMS'} !`
        : `Code sent via ${type}!`)
    } catch (error) {
      console.error('Erreur envoi code:', error)
      alert(language === 'fr' ? 'Erreur lors de l\'envoi du code' : 'Error sending code')
    } finally {
      setSendingCode(false)
    }
  }

  // Vérifier le code et mettre à jour email/téléphone
  const verifyAndUpdate = async (type) => {
    if (verificationCode.length !== 6) {
      alert(language === 'fr' ? 'Le code doit contenir 6 chiffres' : 'Code must be 6 digits')
      return
    }
    
    setVerifying(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (type === 'email') {
        const { error } = await supabase.auth.updateUser({ email: newEmail })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.updateUser({
          data: { phone: newPhone }
        })
        if (error) throw error
      }
      
      setEditingEmail(false)
      setEditingPhone(false)
      setCodeSent(false)
      setVerificationCode('')
      alert(language === 'fr' ? 'Modification effectuée !' : 'Update successful!')
    } catch (error) {
      console.error('Erreur vérification:', error)
      alert(language === 'fr' ? 'Code incorrect ou erreur' : 'Invalid code or error')
    } finally {
      setVerifying(false)
    }
  }

  // Vérifier le mot de passe actuel
  const verifyCurrentPassword = async () => {
    if (!passwordData.current) {
      setPasswordError(language === 'fr' ? 'Entrez votre mot de passe actuel' : 'Enter your current password')
      return
    }
    
    setVerifyingCurrent(true)
    setPasswordError('')
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: passwordData.current
      })
      
      if (error) {
        setPasswordError(language === 'fr' ? 'Mot de passe actuel incorrect' : 'Current password is incorrect')
        return
      }
      
      setCurrentPasswordVerified(true)
      setPasswordStep(2)
    } catch (error) {
      setPasswordError(language === 'fr' ? 'Erreur de vérification' : 'Verification error')
    } finally {
      setVerifyingCurrent(false)
    }
  }

  // Changer le mot de passe
  const changePassword = async () => {
    setPasswordError('')
    setPasswordSuccess(false)
    
    if (passwordData.new !== passwordData.confirm) {
      setPasswordError(language === 'fr' ? 'Les mots de passe ne correspondent pas' : 'Passwords do not match')
      return
    }
    
    if (passwordData.new.length < 6) {
      setPasswordError(language === 'fr' ? 'Le mot de passe doit contenir au moins 6 caractères' : 'Password must be at least 6 characters')
      return
    }
    
    setSavingPassword(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.new
      })
      if (error) throw error
      
      setPasswordSuccess(true)
      setPasswordData({ current: '', new: '', confirm: '' })
      setPasswordStep(1)
      setCurrentPasswordVerified(false)
      setTimeout(() => {
        setActiveSection(null)
        setPasswordSuccess(false)
      }, 2000)
    } catch (error) {
      console.error('Erreur changement mot de passe:', error)
      setPasswordError(error.message || (language === 'fr' ? 'Erreur lors du changement' : 'Error changing password'))
    } finally {
      setSavingPassword(false)
    }
  }

  // Supprimer le compte
  const deleteAccount = async () => {
    if (deleteConfirmText !== 'SUPPRIMER') return
    
    setDeleting(true)
    try {
      await supabase.from('transactions').delete().eq('user_id', user.id)
      await supabase.from('objectives').delete().eq('user_id', user.id)
      await supabase.from('recurring_transactions').delete().eq('user_id', user.id)
      await supabase.from('notifications').delete().eq('user_id', user.id)
      await supabase.from('notification_preferences').delete().eq('user_id', user.id)
      await supabase.from('push_tokens').delete().eq('user_id', user.id)
      
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Erreur suppression compte:', error)
      alert(language === 'fr' ? 'Erreur lors de la suppression' : 'Error deleting account')
    } finally {
      setDeleting(false)
    }
  }

  const userEmail = user?.email || 'utilisateur@email.com'
  const userMetadata = user?.user_metadata || {}
  const userName = userMetadata.name || `${userMetadata.firstName || ''} ${userMetadata.lastName || ''}`.trim() || userEmail.split('@')[0]
  const userFirstName = userMetadata.firstName || userName.split(' ')[0]
  const userPhone = userMetadata.phone || ''
  const currentLangLabel = AVAILABLE_LANGUAGES.find(l => l.code === language)?.label
  const selectedCountry = COUNTRIES.find(c => c.code === personalInfo.country) || COUNTRIES[0]
  const selectedGender = GENDER_OPTIONS.find(g => g.value === personalInfo.gender)

  return (
    <div className={`min-h-screen pb-24 ${isDark ? 'bg-seka-dark' : 'bg-gray-50'}`}>
      {/* Input file caché pour l'avatar */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarChange}
        className="hidden"
      />

      {/* Header */}
      <header className={`sticky top-0 z-10 backdrop-blur-xl border-b px-4 py-4 ${isDark ? 'bg-seka-dark/95 border-seka-border' : 'bg-white/95 border-gray-200'}`}>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              if (activeSection) {
                setActiveSection(null)
                setPasswordStep(1)
                setCurrentPasswordVerified(false)
                setPasswordData({ current: '', new: '', confirm: '' })
                setPasswordError('')
                setEditingEmail(false)
                setEditingPhone(false)
                setCodeSent(false)
                setVerificationCode('')
              } else {
                navigate('/')
              }
            }} 
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-seka-card' : 'bg-gray-100'}`}
          >
            <ArrowLeft className={`w-5 h-5 ${isDark ? 'text-seka-text' : 'text-gray-800'}`} />
          </button>
          <h1 className={`text-xl font-bold ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>
            {activeSection === 'personal' ? (language === 'fr' ? 'Informations personnelles' : 'Personal Info') :
             activeSection === 'email' ? (language === 'fr' ? 'Email et téléphone' : 'Email and Phone') :
             activeSection === 'security' ? (language === 'fr' ? 'Sécurité' : 'Security') :
             activeSection === 'notifications' ? (t('profile.notifications') || 'Notifications') :
             activeSection === 'help' ? (language === 'fr' ? 'Aide' : 'Help') :
             (t('profile.title') || 'Profil')}
          </h1>
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        
        {/* ==================== SECTION: Informations personnelles ==================== */}
        {activeSection === 'personal' && (
          <div className={`rounded-2xl overflow-hidden ${isDark ? 'bg-seka-card border border-seka-border' : 'bg-white shadow-sm border border-gray-100'}`}>
            <div className="p-4 space-y-4">
              {/* Nom */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-seka-text' : 'text-gray-700'}`}>
                  {language === 'fr' ? 'Nom' : 'Last name'} *
                </label>
                <input
                  type="text"
                  value={personalInfo.lastName}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, lastName: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl ${isDark ? 'bg-seka-darker text-seka-text border border-seka-border' : 'bg-gray-100 text-gray-900 border border-gray-200'}`}
                  placeholder="Votre nom"
                />
              </div>
              
              {/* Prénom */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-seka-text' : 'text-gray-700'}`}>
                  {language === 'fr' ? 'Prénom' : 'First name'} *
                </label>
                <input
                  type="text"
                  value={personalInfo.firstName}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, firstName: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl ${isDark ? 'bg-seka-darker text-seka-text border border-seka-border' : 'bg-gray-100 text-gray-900 border border-gray-200'}`}
                  placeholder="Votre prénom"
                />
              </div>
              
              {/* Date de naissance */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-seka-text' : 'text-gray-700'}`}>
                  <Calendar className="w-4 h-4 inline mr-2" />
                  {language === 'fr' ? 'Date de naissance' : 'Birth date'}
                </label>
                <input
                  type="date"
                  value={personalInfo.birthDate}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, birthDate: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl ${isDark ? 'bg-seka-darker text-seka-text border border-seka-border' : 'bg-gray-100 text-gray-900 border border-gray-200'}`}
                />
              </div>
              
              {/* Sexe */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-seka-text' : 'text-gray-700'}`}>
                  <Users className="w-4 h-4 inline mr-2" />
                  {language === 'fr' ? 'Sexe' : 'Gender'}
                </label>
                <button
                  onClick={() => setShowGenderPicker(true)}
                  className={`w-full px-4 py-3 rounded-xl flex items-center justify-between ${isDark ? 'bg-seka-darker text-seka-text border border-seka-border' : 'bg-gray-100 text-gray-900 border border-gray-200'}`}
                >
                  <span>
                    {selectedGender 
                      ? (language === 'fr' ? selectedGender.labelFr : selectedGender.labelEn)
                      : (language === 'fr' ? 'Sélectionner' : 'Select')}
                  </span>
                  <ChevronRight className={`w-5 h-5 ${isDark ? 'text-seka-text-muted' : 'text-gray-400'}`} />
                </button>
              </div>
              
              {/* Pays */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-seka-text' : 'text-gray-700'}`}>
                  <MapPin className="w-4 h-4 inline mr-2" />
                  {language === 'fr' ? 'Pays' : 'Country'}
                </label>
                <button
                  onClick={() => setShowCountryPicker(true)}
                  className={`w-full px-4 py-3 rounded-xl flex items-center justify-between ${isDark ? 'bg-seka-darker text-seka-text border border-seka-border' : 'bg-gray-100 text-gray-900 border border-gray-200'}`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-xl">{selectedCountry.flag}</span>
                    <span>{selectedCountry.name}</span>
                  </span>
                  <ChevronRight className={`w-5 h-5 ${isDark ? 'text-seka-text-muted' : 'text-gray-400'}`} />
                </button>
                <p className={`text-xs mt-1 ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>
                  {language === 'fr' 
                    ? '💡 La devise sera automatiquement définie selon votre pays'
                    : '💡 Currency will be automatically set based on your country'}
                </p>
              </div>
              
              {/* Bouton sauvegarder */}
              <button
                onClick={savePersonalInfo}
                disabled={savingPersonal || !personalInfo.firstName || !personalInfo.lastName}
                className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 ${
                  personalInfo.firstName && personalInfo.lastName
                    ? 'bg-seka-green text-seka-darker'
                    : isDark ? 'bg-seka-darker text-seka-text-muted' : 'bg-gray-200 text-gray-400'
                }`}
              >
                {savingPersonal ? (
                  <div className="w-5 h-5 border-2 border-seka-darker/30 border-t-seka-darker rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    {language === 'fr' ? 'Enregistrer' : 'Save'}
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ==================== SECTION: Email et téléphone ==================== */}
        {activeSection === 'email' && (
          <div className="space-y-4">
            {/* Email */}
            <div className={`rounded-2xl overflow-hidden ${isDark ? 'bg-seka-card border border-seka-border' : 'bg-white shadow-sm border border-gray-100'}`}>
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <label className={`text-sm font-medium ${isDark ? 'text-seka-text' : 'text-gray-700'}`}>
                    Email
                  </label>
                  {!editingEmail && (
                    <button
                      onClick={() => setEditingEmail(true)}
                      className="text-sm text-seka-green font-medium"
                    >
                      {language === 'fr' ? 'Modifier' : 'Edit'}
                    </button>
                  )}
                </div>
                
                {!editingEmail ? (
                  <div className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 ${isDark ? 'bg-seka-darker border border-seka-border' : 'bg-gray-100 border border-gray-200'}`}>
                    <Mail className={`w-5 h-5 ${isDark ? 'text-seka-text-muted' : 'text-gray-400'}`} />
                    <span className={isDark ? 'text-seka-text' : 'text-gray-900'}>{userEmail}</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl ${isDark ? 'bg-seka-darker text-seka-text border border-seka-border' : 'bg-gray-100 text-gray-900 border border-gray-200'}`}
                      placeholder="nouveau@email.com"
                    />
                    
                    {!codeSent ? (
                      <button
                        onClick={() => sendVerificationCode('email')}
                        disabled={sendingCode || newEmail === userEmail}
                        className={`w-full py-3 rounded-xl font-medium ${
                          newEmail !== userEmail
                            ? 'bg-seka-green text-seka-darker'
                            : isDark ? 'bg-seka-darker text-seka-text-muted' : 'bg-gray-200 text-gray-400'
                        }`}
                      >
                        {sendingCode ? (
                          <div className="w-5 h-5 border-2 border-seka-darker/30 border-t-seka-darker rounded-full animate-spin mx-auto" />
                        ) : (
                          language === 'fr' ? 'Envoyer le code de vérification' : 'Send verification code'
                        )}
                      </button>
                    ) : (
                      <>
                        <div>
                          <label className={`block text-sm mb-2 ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>
                            {language === 'fr' ? 'Code reçu par email' : 'Code received by email'}
                          </label>
                          <input
                            type="text"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            className={`w-full px-4 py-3 rounded-xl text-center text-2xl tracking-widest font-mono ${isDark ? 'bg-seka-darker text-seka-text border border-seka-border' : 'bg-gray-100 text-gray-900 border border-gray-200'}`}
                            placeholder="000000"
                            maxLength={6}
                          />
                        </div>
                        <button
                          onClick={() => verifyAndUpdate('email')}
                          disabled={verifying || verificationCode.length !== 6}
                          className={`w-full py-3 rounded-xl font-medium ${
                            verificationCode.length === 6
                              ? 'bg-seka-green text-seka-darker'
                              : isDark ? 'bg-seka-darker text-seka-text-muted' : 'bg-gray-200 text-gray-400'
                          }`}
                        >
                          {verifying ? (
                            <div className="w-5 h-5 border-2 border-seka-darker/30 border-t-seka-darker rounded-full animate-spin mx-auto" />
                          ) : (
                            language === 'fr' ? 'Vérifier et mettre à jour' : 'Verify and update'
                          )}
                        </button>
                      </>
                    )}
                    
                    <button
                      onClick={() => {
                        setEditingEmail(false)
                        setCodeSent(false)
                        setVerificationCode('')
                        setNewEmail(userEmail)
                      }}
                      className={`w-full py-2 text-sm ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}
                    >
                      {language === 'fr' ? 'Annuler' : 'Cancel'}
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Téléphone */}
            <div className={`rounded-2xl overflow-hidden ${isDark ? 'bg-seka-card border border-seka-border' : 'bg-white shadow-sm border border-gray-100'}`}>
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <label className={`text-sm font-medium ${isDark ? 'text-seka-text' : 'text-gray-700'}`}>
                    {language === 'fr' ? 'Téléphone' : 'Phone'}
                  </label>
                  {!editingPhone && (
                    <button
                      onClick={() => setEditingPhone(true)}
                      className="text-sm text-seka-green font-medium"
                    >
                      {language === 'fr' ? 'Modifier' : 'Edit'}
                    </button>
                  )}
                </div>
                
                {!editingPhone ? (
                  <div className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 ${isDark ? 'bg-seka-darker border border-seka-border' : 'bg-gray-100 border border-gray-200'}`}>
                    <Phone className={`w-5 h-5 ${isDark ? 'text-seka-text-muted' : 'text-gray-400'}`} />
                    <span className={isDark ? 'text-seka-text' : 'text-gray-900'}>
                      {userPhone || (language === 'fr' ? 'Non renseigné' : 'Not provided')}
                    </span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <input
                      type="tel"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl ${isDark ? 'bg-seka-darker text-seka-text border border-seka-border' : 'bg-gray-100 text-gray-900 border border-gray-200'}`}
                      placeholder="+229 XX XX XX XX"
                    />
                    
                    {!codeSent ? (
                      <button
                        onClick={() => sendVerificationCode('sms')}
                        disabled={sendingCode || !newPhone}
                        className={`w-full py-3 rounded-xl font-medium ${
                          newPhone
                            ? 'bg-seka-green text-seka-darker'
                            : isDark ? 'bg-seka-darker text-seka-text-muted' : 'bg-gray-200 text-gray-400'
                        }`}
                      >
                        {sendingCode ? (
                          <div className="w-5 h-5 border-2 border-seka-darker/30 border-t-seka-darker rounded-full animate-spin mx-auto" />
                        ) : (
                          language === 'fr' ? 'Envoyer le code par SMS' : 'Send code via SMS'
                        )}
                      </button>
                    ) : (
                      <>
                        <div>
                          <label className={`block text-sm mb-2 ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>
                            {language === 'fr' ? 'Code reçu par SMS' : 'Code received by SMS'}
                          </label>
                          <input
                            type="text"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            className={`w-full px-4 py-3 rounded-xl text-center text-2xl tracking-widest font-mono ${isDark ? 'bg-seka-darker text-seka-text border border-seka-border' : 'bg-gray-100 text-gray-900 border border-gray-200'}`}
                            placeholder="000000"
                            maxLength={6}
                          />
                        </div>
                        <button
                          onClick={() => verifyAndUpdate('phone')}
                          disabled={verifying || verificationCode.length !== 6}
                          className={`w-full py-3 rounded-xl font-medium ${
                            verificationCode.length === 6
                              ? 'bg-seka-green text-seka-darker'
                              : isDark ? 'bg-seka-darker text-seka-text-muted' : 'bg-gray-200 text-gray-400'
                          }`}
                        >
                          {verifying ? (
                            <div className="w-5 h-5 border-2 border-seka-darker/30 border-t-seka-darker rounded-full animate-spin mx-auto" />
                          ) : (
                            language === 'fr' ? 'Vérifier et mettre à jour' : 'Verify and update'
                          )}
                        </button>
                      </>
                    )}
                    
                    <button
                      onClick={() => {
                        setEditingPhone(false)
                        setCodeSent(false)
                        setVerificationCode('')
                        setNewPhone(userPhone)
                      }}
                      className={`w-full py-2 text-sm ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}
                    >
                      {language === 'fr' ? 'Annuler' : 'Cancel'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================== SECTION: Sécurité ==================== */}
        {activeSection === 'security' && (
          <div className={`rounded-2xl overflow-hidden ${isDark ? 'bg-seka-card border border-seka-border' : 'bg-white shadow-sm border border-gray-100'}`}>
            <div className="p-4 space-y-4">
              <h3 className={`font-semibold ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>
                {language === 'fr' ? 'Changer le mot de passe' : 'Change password'}
              </h3>
              
              {/* Étape 1: Mot de passe actuel */}
              {passwordStep === 1 && (
                <>
                  <p className={`text-sm ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>
                    {language === 'fr' 
                      ? 'Pour votre sécurité, veuillez d\'abord entrer votre mot de passe actuel.'
                      : 'For your security, please first enter your current password.'}
                  </p>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-seka-text' : 'text-gray-700'}`}>
                      {language === 'fr' ? 'Mot de passe actuel' : 'Current password'}
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? 'text' : 'password'}
                        value={passwordData.current}
                        onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                        className={`w-full px-4 py-3 pr-12 rounded-xl ${isDark ? 'bg-seka-darker text-seka-text border border-seka-border' : 'bg-gray-100 text-gray-900 border border-gray-200'}`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showPasswords.current ? (
                          <EyeOff className={`w-5 h-5 ${isDark ? 'text-seka-text-muted' : 'text-gray-400'}`} />
                        ) : (
                          <Eye className={`w-5 h-5 ${isDark ? 'text-seka-text-muted' : 'text-gray-400'}`} />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  {passwordError && (
                    <p className="text-sm text-seka-red">{passwordError}</p>
                  )}
                  
                  <button
                    onClick={verifyCurrentPassword}
                    disabled={verifyingCurrent || !passwordData.current}
                    className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 ${
                      passwordData.current
                        ? 'bg-seka-green text-seka-darker'
                        : isDark ? 'bg-seka-darker text-seka-text-muted' : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {verifyingCurrent ? (
                      <div className="w-5 h-5 border-2 border-seka-darker/30 border-t-seka-darker rounded-full animate-spin" />
                    ) : (
                      <>
                        <Lock className="w-5 h-5" />
                        {language === 'fr' ? 'Vérifier' : 'Verify'}
                      </>
                    )}
                  </button>
                </>
              )}
              
              {/* Étape 2: Nouveau mot de passe */}
              {passwordStep === 2 && currentPasswordVerified && (
                <>
                  <div className={`p-3 rounded-xl flex items-center gap-2 ${isDark ? 'bg-seka-green/10' : 'bg-green-50'}`}>
                    <Check className="w-5 h-5 text-seka-green" />
                    <span className={`text-sm ${isDark ? 'text-seka-green' : 'text-green-700'}`}>
                      {language === 'fr' ? 'Mot de passe actuel vérifié' : 'Current password verified'}
                    </span>
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-seka-text' : 'text-gray-700'}`}>
                      {language === 'fr' ? 'Nouveau mot de passe' : 'New password'}
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? 'text' : 'password'}
                        value={passwordData.new}
                        onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                        className={`w-full px-4 py-3 pr-12 rounded-xl ${isDark ? 'bg-seka-darker text-seka-text border border-seka-border' : 'bg-gray-100 text-gray-900 border border-gray-200'}`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showPasswords.new ? (
                          <EyeOff className={`w-5 h-5 ${isDark ? 'text-seka-text-muted' : 'text-gray-400'}`} />
                        ) : (
                          <Eye className={`w-5 h-5 ${isDark ? 'text-seka-text-muted' : 'text-gray-400'}`} />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-seka-text' : 'text-gray-700'}`}>
                      {language === 'fr' ? 'Confirmer le mot de passe' : 'Confirm password'}
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={passwordData.confirm}
                        onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                        className={`w-full px-4 py-3 pr-12 rounded-xl ${isDark ? 'bg-seka-darker text-seka-text border border-seka-border' : 'bg-gray-100 text-gray-900 border border-gray-200'}`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        {showPasswords.confirm ? (
                          <EyeOff className={`w-5 h-5 ${isDark ? 'text-seka-text-muted' : 'text-gray-400'}`} />
                        ) : (
                          <Eye className={`w-5 h-5 ${isDark ? 'text-seka-text-muted' : 'text-gray-400'}`} />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  {passwordError && (
                    <p className="text-sm text-seka-red">{passwordError}</p>
                  )}
                  
                  {passwordSuccess && (
                    <p className="text-sm text-seka-green">
                      {language === 'fr' ? 'Mot de passe modifié avec succès !' : 'Password changed successfully!'}
                    </p>
                  )}
                  
                  <button
                    onClick={changePassword}
                    disabled={savingPassword || !passwordData.new || !passwordData.confirm}
                    className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 ${
                      passwordData.new && passwordData.confirm
                        ? 'bg-seka-green text-seka-darker'
                        : isDark ? 'bg-seka-darker text-seka-text-muted' : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {savingPassword ? (
                      <div className="w-5 h-5 border-2 border-seka-darker/30 border-t-seka-darker rounded-full animate-spin" />
                    ) : (
                      <>
                        <Lock className="w-5 h-5" />
                        {language === 'fr' ? 'Changer le mot de passe' : 'Change password'}
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* ==================== SECTION: Centre d'aide ==================== */}
        {activeSection === 'help' && (
          <div className="space-y-4">
            <div className={`rounded-2xl overflow-hidden ${isDark ? 'bg-seka-card border border-seka-border' : 'bg-white shadow-sm border border-gray-100'}`}>
              <div className="p-4 space-y-4">
                <div className="text-center py-4">
                  <HelpCircle className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-seka-green' : 'text-green-500'}`} />
                  <h3 className={`text-lg font-bold ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>
                    {language === 'fr' ? 'Besoin d\'aide ?' : 'Need help?'}
                  </h3>
                  <p className={`text-sm mt-2 ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>
                    {language === 'fr' 
                      ? 'Contactez-nous pour toute question ou suggestion'
                      : 'Contact us for any questions or suggestions'}
                  </p>
                </div>
                
                <a
                  href="mailto:support@sekamoney.com"
                  className={`w-full py-3 px-4 rounded-xl flex items-center gap-3 ${isDark ? 'bg-seka-darker' : 'bg-gray-100'}`}
                >
                  <Mail className={`w-5 h-5 ${isDark ? 'text-seka-green' : 'text-green-500'}`} />
                  <div className="flex-1 text-left">
                    <p className={`text-sm font-medium ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>
                      {language === 'fr' ? 'Email de support' : 'Support email'}
                    </p>
                    <p className={`text-xs ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>
                      support@sekamoney.com
                    </p>
                  </div>
                  <ExternalLink className={`w-4 h-4 ${isDark ? 'text-seka-text-muted' : 'text-gray-400'}`} />
                </a>
                
                <a
                  href="https://wa.me/22990000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full py-3 px-4 rounded-xl flex items-center gap-3 ${isDark ? 'bg-seka-darker' : 'bg-gray-100'}`}
                >
                  <Phone className={`w-5 h-5 ${isDark ? 'text-seka-green' : 'text-green-500'}`} />
                  <div className="flex-1 text-left">
                    <p className={`text-sm font-medium ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>
                      WhatsApp
                    </p>
                    <p className={`text-xs ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>
                      +229 90 00 00 00
                    </p>
                  </div>
                  <ExternalLink className={`w-4 h-4 ${isDark ? 'text-seka-text-muted' : 'text-gray-400'}`} />
                </a>
              </div>
            </div>
            
            <div className={`rounded-2xl overflow-hidden ${isDark ? 'bg-seka-card border border-seka-border' : 'bg-white shadow-sm border border-gray-100'}`}>
              <div className={`px-4 py-3 border-b ${isDark ? 'border-seka-border' : 'border-gray-100'}`}>
                <h3 className={`font-semibold ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>
                  {language === 'fr' ? 'Questions fréquentes' : 'FAQ'}
                </h3>
              </div>
              <div className="p-4 space-y-3">
                <FAQItem
                  question={language === 'fr' ? 'Comment ajouter une transaction ?' : 'How to add a transaction?'}
                  answer={language === 'fr' 
                    ? 'Appuyez sur le bouton + en bas de l\'écran et remplissez les informations.'
                    : 'Tap the + button at the bottom and fill in the details.'}
                  isDark={isDark}
                />
                <FAQItem
                  question={language === 'fr' ? 'Comment créer un objectif d\'épargne ?' : 'How to create a savings goal?'}
                  answer={language === 'fr'
                    ? 'Allez dans l\'onglet Objectifs et appuyez sur "Nouvel objectif".'
                    : 'Go to Goals tab and tap "New goal".'}
                  isDark={isDark}
                />
                <FAQItem
                  question={language === 'fr' ? 'Mes données sont-elles sécurisées ?' : 'Is my data secure?'}
                  answer={language === 'fr'
                    ? 'Oui, toutes vos données sont chiffrées et stockées de manière sécurisée.'
                    : 'Yes, all your data is encrypted and stored securely.'}
                  isDark={isDark}
                />
              </div>
            </div>
          </div>
        )}

        {/* ==================== SECTION: Notifications ==================== */}
        {activeSection === 'notifications' && (
          <div className={`rounded-2xl overflow-hidden ${isDark ? 'bg-seka-card border border-seka-border' : 'bg-white shadow-sm border border-gray-100'}`}>
            <div className="p-4 space-y-4">
              <NotificationToggle
                label={language === 'fr' ? 'Alertes budget' : 'Budget alerts'}
                description={language === 'fr' ? 'Quand tu dépenses trop vite' : 'When you spend too fast'}
                isDark={isDark}
                checked={notifications?.budget_alerts}
                onChange={() => updatePreferences({ budget_alerts: !notifications?.budget_alerts })}
              />
              <NotificationToggle
                label={language === 'fr' ? 'Progression objectifs' : 'Goal progress'}
                description={language === 'fr' ? 'Alertes de progression vers tes objectifs' : 'Progress alerts for your goals'}
                isDark={isDark}
                checked={notifications?.goal_progress}
                onChange={() => updatePreferences({ goal_progress: !notifications?.goal_progress })}
              />
              <NotificationToggle
                label={language === 'fr' ? 'Transactions récurrentes' : 'Recurring transactions'}
                description={language === 'fr' ? 'Quand une transaction automatique est ajoutée' : 'When an automatic transaction is added'}
                isDark={isDark}
                checked={notifications?.recurring_reminders}
                onChange={() => updatePreferences({ recurring_reminders: !notifications?.recurring_reminders })}
              />
              <NotificationToggle
                label={language === 'fr' ? 'Résumé hebdomadaire' : 'Weekly summary'}
                description={language === 'fr' ? 'Bilan de ta semaine chaque dimanche' : 'Weekly summary every Sunday'}
                isDark={isDark}
                checked={notifications?.weekly_summary}
                onChange={() => updatePreferences({ weekly_summary: !notifications?.weekly_summary })}
              />
              <NotificationToggle
                label={language === 'fr' ? 'Rappel quotidien' : 'Daily reminder'}
                description={language === 'fr' ? 'Rappel pour noter tes dépenses' : 'Reminder to log your expenses'}
                isDark={isDark}
                checked={notifications?.daily_reminder}
                onChange={() => updatePreferences({ daily_reminder: !notifications?.daily_reminder })}
              />
            </div>

            <button
              onClick={() => setActiveSection(null)}
              className="w-full mt-2 py-3 rounded-xl bg-seka-green text-seka-darker font-semibold mx-4 mb-4"
              style={{ width: 'calc(100% - 2rem)' }}
            >
              {t('app.save') || 'Enregistrer'}
            </button>
          </div>
        )}

        {/* ==================== MAIN SECTIONS ==================== */}
        {!activeSection && (
          <>
            {/* Profile Card */}
            <div className={`p-6 rounded-2xl relative overflow-hidden ${isDark ? 'bg-seka-card border border-seka-border' : 'bg-white shadow-sm border border-gray-100'}`}>
              <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-r from-seka-green/20 to-seka-gold/20" />

              <div className="relative flex items-center gap-4">
                <div className="relative">
                  {/* Avatar avec upload */}
                  <button
                    onClick={handleAvatarClick}
                    disabled={uploadingAvatar}
                    className={`w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold overflow-hidden ${isDark ? 'bg-seka-darker text-seka-green' : 'bg-gray-100 text-gray-600'}`}
                  >
                    {uploadingAvatar ? (
                      <div className="w-8 h-8 border-2 border-seka-green/30 border-t-seka-green rounded-full animate-spin" />
                    ) : avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      userName.charAt(0).toUpperCase()
                    )}
                  </button>
                  <button 
                    onClick={handleAvatarClick}
                    className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-seka-green flex items-center justify-center shadow-lg"
                  >
                    <Camera className="w-3.5 h-3.5 text-seka-darker" />
                  </button>
                </div>

                <div className="flex-1">
                  <h2 className={`text-lg font-bold ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>{userName}</h2>
                  <p className={`text-sm ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>{userEmail}</p>

                  <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-seka-gold/20 text-seka-gold text-xs font-medium">
                    <Crown className="w-3 h-3" />
                    {language === 'fr' ? 'Compte Gratuit' : 'Free Account'}
                  </div>
                </div>
              </div>

              <button className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-seka-gold to-amber-500 text-seka-darker font-semibold flex items-center justify-center gap-2">
                <Crown className="w-5 h-5" />
                {language === 'fr' ? 'Passer à Premium' : 'Upgrade to Premium'}
              </button>
            </div>

            {/* Lier des comptes */}
            <div className={`rounded-2xl overflow-hidden ${isDark ? 'bg-seka-card border border-seka-border' : 'bg-white shadow-sm border border-gray-100'}`}>
              <button
                onClick={() => setShowLinkedAccounts(!showLinkedAccounts)}
                className={`w-full px-4 py-4 flex items-center gap-3 ${isDark ? 'hover:bg-seka-darker/50' : 'hover:bg-gray-50'} transition-colors`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-seka-green/20' : 'bg-green-100'}`}>
                  <Link2 className="w-5 h-5 text-seka-green" />
                </div>
                <div className="flex-1 text-left">
                  <p className={`font-medium ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>
                    {t('profile.linkedAccounts') || 'Lier des comptes'}
                  </p>
                  <p className={`text-xs ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>
                    {t('profile.comingSoon') || 'Bientôt disponible'}
                  </p>
                </div>
                <ChevronDown className={`w-5 h-5 transition-transform ${showLinkedAccounts ? 'rotate-180' : ''} ${isDark ? 'text-seka-text-muted' : 'text-gray-400'}`} />
              </button>

              {showLinkedAccounts && (
                <div className={`px-4 pb-4 space-y-3 border-t ${isDark ? 'border-seka-border' : 'border-gray-100'}`}>
                  <p className={`text-xs pt-3 ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>
                    {language === 'fr' ? 'Connectez vos comptes Mobile Money pour synchroniser automatiquement vos transactions.' : 'Connect your Mobile Money accounts to automatically sync your transactions.'}
                  </p>

                  {MOBILE_ACCOUNTS.map(account => (
                    <button
                      key={account.id}
                      className={`w-full p-3 rounded-xl flex items-center gap-3 border-2 border-dashed transition-colors ${isDark ? 'border-seka-border hover:border-seka-green/50' : 'border-gray-200 hover:border-green-300'}`}
                    >
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold"
                        style={{ backgroundColor: account.color, color: account.textColor }}
                      >
                        {account.name.charAt(0)}
                      </div>
                      <div className="flex-1 text-left">
                        <p className={`font-medium ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>{account.name}</p>
                        <p className={`text-xs ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>
                          {t('profile.comingSoon') || 'Bientôt disponible'}
                        </p>
                      </div>
                      <ChevronRight className={`w-4 h-4 ${isDark ? 'text-seka-text-muted' : 'text-gray-400'}`} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Compte */}
            <div className={`rounded-2xl overflow-hidden ${isDark ? 'bg-seka-card border border-seka-border' : 'bg-white shadow-sm border border-gray-100'}`}>
              <div className={`px-4 py-2 ${isDark ? 'bg-seka-darker' : 'bg-gray-50'}`}>
                <p className={`text-xs font-medium ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>
                  {language === 'fr' ? 'COMPTE' : 'ACCOUNT'}
                </p>
              </div>

              <MenuItem
                icon={<User className="w-5 h-5" />}
                label={t('profile.personalInfo') || 'Informations personnelles'}
                isDark={isDark}
                onClick={() => setActiveSection('personal')}
              />
              <MenuItem
                icon={<Mail className="w-5 h-5" />}
                label={language === 'fr' ? 'Email et téléphone' : 'Email and phone'}
                value={userEmail.length > 20 ? userEmail.substring(0, 20) + '...' : userEmail}
                isDark={isDark}
                onClick={() => setActiveSection('email')}
              />
              <MenuItem
                icon={<Shield className="w-5 h-5" />}
                label={language === 'fr' ? 'Sécurité et mot de passe' : 'Security and password'}
                isDark={isDark}
                onClick={() => setActiveSection('security')}
              />
            </div>

            {/* Préférences */}
            <div className={`rounded-2xl overflow-hidden ${isDark ? 'bg-seka-card border border-seka-border' : 'bg-white shadow-sm border border-gray-100'}`}>
              <div className={`px-4 py-2 ${isDark ? 'bg-seka-darker' : 'bg-gray-50'}`}>
                <p className={`text-xs font-medium ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>
                  {t('profile.preferences') || 'PRÉFÉRENCES'}
                </p>
              </div>

              <MenuItem
                icon={isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                label={t('profile.theme') || 'Thème'}
                value={isDark ? (t('profile.darkMode') || 'Mode sombre') : (t('profile.lightMode') || 'Mode clair')}
                isDark={isDark}
                hasToggle
                isToggled={isDark}
                onToggle={toggleTheme}
              />
              <MenuItem
                icon={<Globe className="w-5 h-5" />}
                label={t('profile.language') || 'Langue'}
                value={currentLangLabel}
                isDark={isDark}
                onClick={openLanguageModal}
              />
              <CurrencySelector isDark={isDark} />
              <MenuItem
                icon={<Bell className="w-5 h-5" />}
                label={t('profile.notifications') || 'Notifications'}
                isDark={isDark}
                onClick={() => setActiveSection('notifications')}
              />
              <MenuItem
                icon={<RefreshCw className="w-5 h-5" />}
                label={language === 'fr' ? 'Transactions récurrentes' : 'Recurring transactions'}
                isDark={isDark}
                onClick={() => navigate('/recurring')}
              />
            </div>

            {/* Données */}
            <div className={`rounded-2xl overflow-hidden ${isDark ? 'bg-seka-card border border-seka-border' : 'bg-white shadow-sm border border-gray-100'}`}>
              <div className={`px-4 py-2 ${isDark ? 'bg-seka-darker' : 'bg-gray-50'}`}>
                <p className={`text-xs font-medium ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>
                  {language === 'fr' ? 'DONNÉES' : 'DATA'}
                </p>
              </div>

              <MenuItem
                icon={<Download className="w-5 h-5" />}
                label={language === 'fr' ? 'Exporter mes données' : 'Export my data'}
                isDark={isDark}
                onClick={openExportModal}
              />
              <MenuItem
                icon={<Trash2 className="w-5 h-5 text-seka-red" />}
                label={t('profile.deleteAccount') || 'Supprimer le compte'}
                labelColor="text-seka-red"
                isDark={isDark}
                onClick={() => setShowDeleteModal(true)}
              />
            </div>

            {/* À propos */}
            <div className={`rounded-2xl overflow-hidden ${isDark ? 'bg-seka-card border border-seka-border' : 'bg-white shadow-sm border border-gray-100'}`}>
              <div className={`px-4 py-2 ${isDark ? 'bg-seka-darker' : 'bg-gray-50'}`}>
                <p className={`text-xs font-medium ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>
                  {language === 'fr' ? 'À PROPOS' : 'ABOUT'}
                </p>
              </div>

              <MenuItem
                icon={<HelpCircle className="w-5 h-5" />}
                label={language === 'fr' ? 'Centre d\'aide' : 'Help center'}
                isDark={isDark}
                onClick={() => navigate('/help')}
              />
              <MenuItem
                icon={<Info className="w-5 h-5" />}
                label={language === 'fr' ? 'Conditions d\'utilisation' : 'Terms of use'}
                isDark={isDark}
                onClick={() => navigate('/terms')}
                
              />
              <MenuItem
                icon={<Shield className="w-5 h-5" />}
                label={language === 'fr' ? 'Politique de confidentialité' : 'Privacy policy'}
                isDark={isDark}
                onClick={() => navigate('/privacy')}
                
              />
              <MenuItem
                icon={<Info className="w-5 h-5" />}
                label={t('profile.version') || 'Version'}
                value="1.0.0 MVP"
                isDark={isDark}
                noArrow
              />
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-semibold ${isDark ? 'bg-seka-red/20 text-seka-red' : 'bg-red-50 text-red-600'}`}
            >
              <LogOut className="w-5 h-5" />
              {t('profile.logout') || 'Déconnexion'}
            </button>
          </>
        )}
      </div>

      {/* Modal de sélection de langue */}
      {showLanguageModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={cancelLanguage}
        >
          <div
            className={`w-full max-w-sm rounded-2xl overflow-hidden ${isDark ? 'bg-seka-card' : 'bg-white'}`}
            onClick={e => e.stopPropagation()}
          >
            <div className={`px-5 py-4 border-b text-center ${isDark ? 'border-seka-border' : 'border-gray-200'}`}>
              <h3 className={`font-semibold text-lg ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>
                {t('languages.title') || 'Langue'}
              </h3>
            </div>

            <div className="p-4 space-y-2">
              {AVAILABLE_LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => setTempLanguage(lang.code)}
                  className={`w-full py-4 px-4 rounded-xl text-center font-medium transition-all ${tempLanguage === lang.code
                      ? 'bg-seka-green text-seka-darker'
                      : isDark
                        ? 'bg-seka-darker text-seka-text hover:bg-seka-darker/70'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            <div className="px-4 pb-4 flex gap-3">
              <button
                onClick={cancelLanguage}
                className={`flex-1 py-3 rounded-xl font-medium ${isDark ? 'bg-seka-darker text-seka-text-muted' : 'bg-gray-100 text-gray-600'}`}
              >
                {t('app.cancel') || 'Annuler'}
              </button>
              <button
                onClick={confirmLanguage}
                className="flex-1 py-3 rounded-xl font-medium bg-seka-green text-seka-darker"
              >
                {t('app.confirm') || 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de sélection de pays */}
      {showCountryPicker && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowCountryPicker(false)}
        >
          <div
            className={`w-full max-w-sm rounded-2xl overflow-hidden max-h-[80vh] ${isDark ? 'bg-seka-card' : 'bg-white'}`}
            onClick={e => e.stopPropagation()}
          >
            <div className={`px-5 py-4 border-b text-center sticky top-0 ${isDark ? 'border-seka-border bg-seka-card' : 'border-gray-200 bg-white'}`}>
              <h3 className={`font-semibold text-lg ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>
                {language === 'fr' ? 'Sélectionner un pays' : 'Select a country'}
              </h3>
            </div>

            <div className="p-4 space-y-2 overflow-y-auto max-h-[60vh]">
              {COUNTRIES.map(country => (
                <button
                  key={country.code}
                  onClick={() => handleCountryChange(country.code)}
                  className={`w-full py-3 px-4 rounded-xl flex items-center gap-3 transition-all ${personalInfo.country === country.code
                      ? 'bg-seka-green text-seka-darker'
                      : isDark
                        ? 'bg-seka-darker text-seka-text hover:bg-seka-darker/70'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                >
                  <span className="text-2xl">{country.flag}</span>
                  <span className="font-medium flex-1 text-left">{country.name}</span>
                  {country.currency && (
                    <span className={`text-xs px-2 py-1 rounded-full ${personalInfo.country === country.code ? 'bg-seka-darker/20' : isDark ? 'bg-seka-card' : 'bg-white'}`}>
                      {country.currency}
                    </span>
                  )}
                  {personalInfo.country === country.code && (
                    <Check className="w-5 h-5" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal de sélection du sexe */}
      {showGenderPicker && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowGenderPicker(false)}
        >
          <div
            className={`w-full max-w-sm rounded-2xl overflow-hidden ${isDark ? 'bg-seka-card' : 'bg-white'}`}
            onClick={e => e.stopPropagation()}
          >
            <div className={`px-5 py-4 border-b text-center ${isDark ? 'border-seka-border' : 'border-gray-200'}`}>
              <h3 className={`font-semibold text-lg ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>
                {language === 'fr' ? 'Sélectionner' : 'Select'}
              </h3>
            </div>

            <div className="p-4 space-y-2">
              {GENDER_OPTIONS.map(option => (
                <button
                  key={option.value}
                  onClick={() => {
                    setPersonalInfo({ ...personalInfo, gender: option.value })
                    setShowGenderPicker(false)
                  }}
                  className={`w-full py-4 px-4 rounded-xl text-center font-medium transition-all ${personalInfo.gender === option.value
                      ? 'bg-seka-green text-seka-darker'
                      : isDark
                        ? 'bg-seka-darker text-seka-text hover:bg-seka-darker/70'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                >
                  {language === 'fr' ? option.labelFr : option.labelEn}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal Supprimer le compte */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className={`w-full max-w-sm rounded-2xl overflow-hidden ${isDark ? 'bg-seka-card' : 'bg-white'}`}
            onClick={e => e.stopPropagation()}
          >
            <div className={`px-5 py-4 border-b ${isDark ? 'border-seka-border' : 'border-gray-200'}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-seka-red/20 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-seka-red" />
                </div>
                <h3 className={`font-semibold text-lg ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>
                  {language === 'fr' ? 'Supprimer le compte' : 'Delete account'}
                </h3>
              </div>
            </div>

            <div className="p-4 space-y-4">
              <p className={`text-sm ${isDark ? 'text-seka-text-muted' : 'text-gray-600'}`}>
                {language === 'fr' 
                  ? 'Cette action est irréversible. Toutes vos données seront supprimées définitivement.'
                  : 'This action is irreversible. All your data will be permanently deleted.'}
              </p>
              
              <p className={`text-sm font-medium ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>
                {language === 'fr'
                  ? 'Tapez SUPPRIMER pour confirmer :'
                  : 'Type DELETE to confirm:'}
              </p>
              
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value.toUpperCase())}
                className={`w-full px-4 py-3 rounded-xl text-center font-mono ${isDark ? 'bg-seka-darker text-seka-text border border-seka-border' : 'bg-gray-100 text-gray-900 border border-gray-200'}`}
                placeholder="SUPPRIMER"
              />
            </div>

            <div className="px-4 pb-4 flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setDeleteConfirmText('')
                }}
                className={`flex-1 py-3 rounded-xl font-medium ${isDark ? 'bg-seka-darker text-seka-text' : 'bg-gray-100 text-gray-600'}`}
              >
                {t('app.cancel') || 'Annuler'}
              </button>
              <button
                onClick={deleteAccount}
                disabled={deleteConfirmText !== 'SUPPRIMER' || deleting}
                className={`flex-1 py-3 rounded-xl font-medium ${
                  deleteConfirmText === 'SUPPRIMER'
                    ? 'bg-seka-red text-white'
                    : isDark ? 'bg-seka-darker text-seka-text-muted' : 'bg-gray-200 text-gray-400'
                }`}
              >
                {deleting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                ) : (
                  language === 'fr' ? 'Supprimer' : 'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Export PDF/Excel */}
      {showExportModal && (
        <ExportData
          transactions={exportTransactions}
          isDark={isDark}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  )
}

function MenuItem({ icon, label, value, isDark, onClick, hasToggle, isToggled, onToggle, external, noArrow, labelColor }) {
  return (
    <button
      onClick={hasToggle ? onToggle : onClick}
      className={`w-full px-4 py-3.5 flex items-center gap-3 border-b last:border-b-0 ${isDark ? 'border-seka-border hover:bg-seka-darker/50' : 'border-gray-100 hover:bg-gray-50'} transition-colors`}
    >
      <span className={isDark ? 'text-seka-text-secondary' : 'text-gray-500'}>{icon}</span>
      <span className={`flex-1 text-left text-sm font-medium ${labelColor || (isDark ? 'text-seka-text' : 'text-gray-900')}`}>{label}</span>
      {value && <span className={`text-sm ${isDark ? 'text-seka-text-muted' : 'text-gray-400'}`}>{value}</span>}
      {hasToggle ? (
        <div className={`w-11 h-6 rounded-full p-0.5 transition-colors ${isToggled ? 'bg-seka-green' : isDark ? 'bg-seka-darker' : 'bg-gray-300'}`}>
          <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${isToggled ? 'translate-x-5' : 'translate-x-0'}`} />
        </div>
      ) : external ? (
        <ExternalLink className={`w-4 h-4 ${isDark ? 'text-seka-text-muted' : 'text-gray-400'}`} />
      ) : !noArrow && (
        <ChevronRight className={`w-4 h-4 ${isDark ? 'text-seka-text-muted' : 'text-gray-400'}`} />
      )}
    </button>
  )
}

function NotificationToggle({ label, description, isDark, checked, onChange }) {
  return (
    <button onClick={onChange} className="w-full flex items-center justify-between py-2">
      <div className="text-left">
        <p className={`text-sm font-medium ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>{label}</p>
        <p className={`text-xs ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>{description}</p>
      </div>
      <div className={`w-11 h-6 rounded-full p-0.5 transition-colors ${checked ? 'bg-seka-green' : isDark ? 'bg-seka-darker' : 'bg-gray-300'}`}>
        <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </div>
    </button>
  )
}

function FAQItem({ question, answer, isDark }) {
  const [open, setOpen] = useState(false)
  
  return (
    <div className={`rounded-xl overflow-hidden ${isDark ? 'bg-seka-darker' : 'bg-gray-100'}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-3 flex items-center justify-between"
      >
        <span className={`text-sm font-medium text-left ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>
          {question}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''} ${isDark ? 'text-seka-text-muted' : 'text-gray-400'}`} />
      </button>
      {open && (
        <div className={`px-4 pb-3 ${isDark ? 'text-seka-text-muted' : 'text-gray-600'}`}>
          <p className="text-sm">{answer}</p>
        </div>
      )}
    </div>
  )
}
