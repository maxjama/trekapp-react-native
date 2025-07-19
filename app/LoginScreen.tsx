import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';

const logo = require('../assets/images/icon.png');

export default function LoginScreen() {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    if (!validateEmail(email)) {
      setError('Inserisci una email valida.');
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError('La password deve essere di almeno 6 caratteri.');
      setLoading(false);
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setSuccess('Login effettuato!');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    if (!validateEmail(email)) {
      setError('Inserisci una email valida.');
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError('La password deve essere di almeno 6 caratteri.');
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError('Le password non coincidono.');
      setLoading(false);
      return;
    }
    if (!name.trim()) {
      setError('Inserisci il tuo nome.');
      setLoading(false);
      return;
    }
    if (!birthDate) {
      setError('Seleziona la tua data di nascita.');
      setLoading(false);
      return;
    }
    if (!acceptTerms) {
      setError('Devi accettare i Termini di Servizio e la Privacy Policy.');
      setLoading(false);
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const db = getFirestore();
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        name,
        birthDate: birthDate.toISOString(),
        email,
      });
      setSuccess('Registrazione completata!');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setError('');
    setSuccess('');
    if (!validateEmail(email)) {
      setError('Inserisci una email valida per il reset.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess('Email di reset inviata! Controlla la tua casella di posta.');
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleDateConfirm = () => {
    if (tempDate) {
      setBirthDate(tempDate);
    }
    setShowDatePicker(false);
  };

  const handleDateCancel = () => {
    setTempDate(birthDate);
    setShowDatePicker(false);
  };

  const openDatePicker = () => {
    setTempDate(birthDate || new Date(2000, 0, 1));
    setShowDatePicker(true);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.gradient} keyboardShouldPersistTaps="handled">
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <MaterialIcons name="landscape" size={48} color="#fff" />
          </View>
          <Text style={styles.appTitle}>TrekApp</Text>
          <Text style={styles.appSubtitle}>La tua avventura inizia qui</Text>
        </View>
        <View style={styles.card}>
          {/* Tabs */}
          <View style={styles.tabsList}>
            <TouchableOpacity
              style={[styles.tabTrigger, tab === 'login' && styles.tabTriggerActive]}
              onPress={() => { setTab('login'); setError(''); setSuccess(''); }}
            >
              <Text style={[styles.tabText, tab === 'login' && styles.tabTextActive]}>Accedi</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabTrigger, tab === 'register' && styles.tabTriggerActive]}
              onPress={() => { setTab('register'); setError(''); setSuccess(''); }}
            >
              <Text style={[styles.tabText, tab === 'register' && styles.tabTextActive]}>Registrati</Text>
            </TouchableOpacity>
          </View>

          {/* Login Tab */}
          {tab === 'login' && (
            <>
              <Text style={styles.cardTitle}>Bentornato!</Text>
              <Text style={styles.cardDescription}>Accedi al tuo account per continuare l'avventura</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="email" size={22} color="#22C55E" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="lock" size={22} color="#22C55E" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                  <MaterialIcons name={showPassword ? 'visibility-off' : 'visibility'} size={22} color="#888" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.forgotContainer} onPress={handleForgotPassword}>
                <Text style={styles.forgotText}>Password dimenticata?</Text>
              </TouchableOpacity>
              <View style={styles.checkboxRow}>
                <TouchableOpacity style={[styles.checkbox, rememberMe && styles.checkboxChecked]} onPress={() => setRememberMe(!rememberMe)}>
                  {rememberMe && <MaterialIcons name="check" size={16} color="#fff" />}
                </TouchableOpacity>
                <Text style={styles.checkboxLabel}>Ricordami</Text>
              </View>
              {error ? <Text style={styles.error}>{error}</Text> : null}
              {success ? <Text style={styles.success}>{success}</Text> : null}
              {loading ? (
                <ActivityIndicator size="large" color="#22C55E" style={{ marginVertical: 16 }} />
              ) : (
                <TouchableOpacity style={styles.button} onPress={handleLogin} activeOpacity={0.8}>
                  <Text style={styles.buttonText}>Accedi</Text>
                </TouchableOpacity>
              )}
              {/* Separator */}
              <View style={styles.separatorRow}>
                <View style={styles.separator} />
                <Text style={styles.separatorText}>oppure</Text>
                <View style={styles.separator} />
              </View>
              {/* Google Button (placeholder) */}
              <TouchableOpacity style={styles.googleButton} activeOpacity={0.8}>
                <Image source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg' }} style={styles.googleIcon} />
                <Text style={styles.googleButtonText}>Continua con Google</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Register Tab */}
          {tab === 'register' && (
            <>
              <Text style={styles.cardTitle}>Unisciti a noi!</Text>
              <Text style={styles.cardDescription}>Crea il tuo account e inizia a esplorare</Text>
              <View style={styles.inputRow}>
                <View style={[styles.inputWrapper, { flex: 1, marginRight: 8 }] }>
                  <MaterialIcons name="person" size={22} color="#22C55E" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Nome"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                  />
                </View>
                {/* Cognome opzionale: puoi aggiungerlo qui se vuoi */}
              </View>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="calendar-today" size={22} color="#22C55E" style={styles.inputIcon} />
                <Text style={[styles.dateText, { color: birthDate ? '#222' : '#888' }]}> 
                  {birthDate ? birthDate.toLocaleDateString() : 'Data di nascita'}
                </Text>
                <TouchableOpacity 
                  onPress={openDatePicker} 
                  activeOpacity={0.7}
                  style={styles.arrowButton}
                >
                  <MaterialIcons name="keyboard-arrow-down" size={22} color="#888" />
                </TouchableOpacity>
                <Modal
                  visible={showDatePicker}
                  transparent={true}
                  animationType="fade"
                  onRequestClose={handleDateCancel}
                >
                  <View style={styles.modalOverlay}>
                    <View style={styles.dateModal}>
                      <View style={styles.dateModalHeader}>
                        <Text style={styles.dateModalTitle}>Seleziona Data di Nascita</Text>
                        <TouchableOpacity onPress={handleDateCancel} style={styles.closeButton}>
                          <MaterialIcons name="close" size={24} color="#666" />
                        </TouchableOpacity>
                      </View>
                      <DateTimePicker
                        value={tempDate || new Date(2000, 0, 1)}
                        mode="date"
                        display="default"
                        onChange={(_, date) => {
                          if (date) setTempDate(date);
                        }}
                        maximumDate={new Date()}
                        style={styles.customDatePicker}
                      />
                      <View style={styles.dateModalFooter}>
                        <TouchableOpacity onPress={handleDateCancel} style={styles.cancelButton}>
                          <Text style={styles.cancelButtonText}>Annulla</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleDateConfirm} style={styles.confirmButton}>
                          <Text style={styles.confirmButtonText}>Conferma</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </Modal>
              </View>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="email" size={22} color="#22C55E" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="lock" size={22} color="#22C55E" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                  <MaterialIcons name={showPassword ? 'visibility-off' : 'visibility'} size={22} color="#888" />
                </TouchableOpacity>
              </View>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="lock" size={22} color="#22C55E" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Conferma Password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                  <MaterialIcons name={showConfirmPassword ? 'visibility-off' : 'visibility'} size={22} color="#888" />
                </TouchableOpacity>
              </View>
              <View style={styles.checkboxRow}>
                <TouchableOpacity style={[styles.checkbox, acceptTerms && styles.checkboxChecked]} onPress={() => setAcceptTerms(!acceptTerms)}>
                  {acceptTerms && <MaterialIcons name="check" size={16} color="#fff" />}
                </TouchableOpacity>
                <Text style={styles.checkboxLabel}>Accetto i <Text style={styles.link}>Termini di Servizio</Text> e la <Text style={styles.link}>Privacy Policy</Text></Text>
              </View>
              {error ? <Text style={styles.error}>{error}</Text> : null}
              {success ? <Text style={styles.success}>{success}</Text> : null}
              {loading ? (
                <ActivityIndicator size="large" color="#22C55E" style={{ marginVertical: 16 }} />
              ) : (
                <TouchableOpacity style={styles.button} onPress={handleSignUp} activeOpacity={0.8}>
                  <Text style={styles.buttonText}>Crea Account</Text>
                </TouchableOpacity>
              )}
              {/* Separator */}
              <View style={styles.separatorRow}>
                <View style={styles.separator} />
                <Text style={styles.separatorText}>oppure</Text>
                <View style={styles.separator} />
              </View>
              {/* Google Button (placeholder) */}
              <TouchableOpacity style={styles.googleButton} activeOpacity={0.8}>
                <Image source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg' }} style={styles.googleIcon} />
                <Text style={styles.googleButtonText}>Registrati con Google</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
        {/* Footer rimosso */}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F3F4F6',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logoCircle: {
    backgroundColor: '#059669',
    padding: 16,
    borderRadius: 40,
    marginBottom: 8,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    letterSpacing: 1,
  },
  appSubtitle: {
    color: '#6B7280',
    fontSize: 16,
    marginTop: 4,
    marginBottom: 8,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20, // ridotto da 28
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    alignItems: 'stretch',
    marginBottom: 16,
  },
  tabsList: {
    flexDirection: 'row',
    marginBottom: 24,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    overflow: 'hidden',
  },
  tabTrigger: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  tabTriggerActive: {
    backgroundColor: '#22C55E',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#fff',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
    color: '#111827',
    flexShrink: 1,
  },
  cardDescription: {
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: 12, // ridotto da 16
    flexShrink: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderColor: '#E5E7EB',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12, // ridotto da 16
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    minHeight: 48,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    paddingHorizontal: 8, // ridotto da 12
    color: '#222',
    minWidth: 0, // previene overflow
  },
  inputIcon: {
    marginRight: 4,
  },
  eyeIcon: {
    padding: 4,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap', // permette il wrap
    gap: 8, // aggiunge spazio tra gli elementi
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#22C55E',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: '#22C55E',
    borderColor: '#22C55E',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
    flexWrap: 'wrap',
  },
  forgotText: {
    color: '#059669',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'right',
    textDecorationLine: 'underline',
  },
  forgotContainer: {
    alignSelf: 'flex-end',
    marginTop: -8,
    marginBottom: 8,
  },
  button: {
    width: '100%',
    backgroundColor: '#22C55E',
    paddingVertical: 14, // ridotto da 16
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 1,
  },
  separatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  separator: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  separatorText: {
    marginHorizontal: 12,
    color: '#6B7280',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 12, // ridotto da 14
    marginBottom: 4,
    width: '100%',
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  googleButtonText: {
    color: '#374151',
    fontWeight: 'bold',
    fontSize: 16,
  },
  success: {
    color: '#22C55E',
    marginBottom: 16,
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    marginBottom: 16,
    fontWeight: 'bold',
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  link: {
    color: '#059669',
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  footerText: {
    color: '#6B7280',
    fontSize: 14,
  },
  dateInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    paddingHorizontal: 12,
  },
  dateText: {
    fontSize: 16,
    flex: 1,
    paddingHorizontal: 12,
  },
  arrowButton: {
    padding: 8,
    marginRight: 4,
  },
  datePicker: {
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    zIndex: 1000,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateModal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 300,
  },
  dateModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  dateModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  customDatePicker: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dateModalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#22C55E',
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
}); 