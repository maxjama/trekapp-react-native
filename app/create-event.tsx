import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Image, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, MapPin, Calendar, Clock, Users, Camera, Plus } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { auth } from '../firebaseConfig';

// Conditionally import MapView components only for native platforms
let MapView: any = null;
let Marker: any = null;
let Polyline: any = null;

if (Platform.OS !== 'web') {
  const MapComponents = require('react-native-maps');
  MapView = MapComponents.default;
  Marker = MapComponents.Marker;
  Polyline = MapComponents.Polyline;
}

export default function CreateEventScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    date: '',
    time: '',
    difficulty: 'Easy',
    maxParticipants: '',
    description: '',
    duration: '',
    elevation: '',
    distance: '',
    meetingPoint: '',
    equipment: '',
  });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState<'date' | 'time'>('date');
  // Stato per i punti del percorso
  const [routePoints, setRoutePoints] = useState<{ latitude: number; longitude: number }[]>([]);
  // Stato per il centro della mappa
  const [mapCenter, setMapCenter] = useState({
    latitude: 45.4642,
    longitude: 9.19,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  });
  // Stato per il tipo di mappa
  const [mapType, setMapType] = useState<'standard' | 'satellite' | 'hybrid'>('satellite');
  // Stato per la modalità di disegno
  const [drawingMode, setDrawingMode] = useState(false);
  // Stato per lo zoom della mappa
  const [mapZoom, setMapZoom] = useState(15);
  // Stato per la navigazione guidata
  const [navigationMode, setNavigationMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedGPX, setSelectedGPX] = useState<string | null>(null);

  const difficulties = ['Easy', 'Moderate', 'Hard'];

  // Funzione per ottenere la data di oggi in formato GG/MM/AAAA
  function getToday() {
    const d = new Date();
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }
  // Funzione per ottenere la data di domani
  function getTomorrow() {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }
  // Funzione per ottenere il prossimo sabato
  function getNextSaturday() {
    const d = new Date();
    const day = d.getDay();
    const diff = (6 - day + 7) % 7 || 7;
    d.setDate(d.getDate() + diff);
    const dd = d.getDate().toString().padStart(2, '0');
    const mm = (d.getMonth() + 1).toString().padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageSelect = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission required', 'Permission to access camera roll is required!');
      return;
    }
    const pickerResult = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
    if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
      setSelectedImage(pickerResult.assets[0].uri);
    }
  };

  // Date picker handler
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      // Format DD/MM/YYYY
      const day = selectedDate.getDate().toString().padStart(2, '0');
      const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
      const year = selectedDate.getFullYear();
      handleInputChange('date', `${day}/${month}/${year}`);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const hours = selectedTime.getHours();
      const minutes = selectedTime.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 || 12;
      const formattedMinutes = minutes.toString().padStart(2, '0');
      handleInputChange('time', `${formattedHours}:${formattedMinutes} ${ampm}`);
    }
  };

  const validateForm = () => {
    const required = ['title', 'location', 'date', 'time', 'maxParticipants', 'description'];
    for (const field of required) {
      const value = formData[field as keyof typeof formData];
      console.log(`Campo ${field}:`, value); // Debug
      if (!value || !value.toString().trim()) {
        Alert.alert('Errore', `Compila il campo ${field}`);
        return false;
      }
    }
    
    if (!selectedImage) {
      Alert.alert('Errore', 'Seleziona un\'immagine per l\'evento');
      return false;
    }
    
    if (routePoints.length < 2) {
      Alert.alert('Errore', 'Aggiungi almeno due punti sulla mappa per creare il percorso');
      return false;
    }
    
    return true;
  };

  const handleCreateEvent = async () => {
    console.log('Inizio handleCreateEvent');
    console.log('FormData:', formData);
    console.log('SelectedImage:', selectedImage);
    console.log('RoutePoints:', routePoints);
    
    if (!validateForm()) {
      console.log('Validazione fallita');
      return;
    }
    
    if (!auth.currentUser) {
      console.log('Utente non autenticato');
      Alert.alert('Errore', 'Devi essere loggato per creare un evento');
      return;
    }

    setLoading(true);
    try {
      console.log('Inizio salvataggio su Firestore...');
      
      // Per ora salviamo solo su Firestore senza Storage
      const db = getFirestore();
      const eventData = {
        title: formData.title,
        location: formData.location,
        date: formData.date,
        time: formData.time,
        difficulty: formData.difficulty,
        maxParticipants: parseInt(formData.maxParticipants),
        description: formData.description,
        duration: formData.duration,
        elevation: formData.elevation,
        distance: formData.distance,
        meetingPoint: formData.meetingPoint,
        equipment: formData.equipment,
        imageUri: selectedImage, // Salviamo l'URI locale per ora
        gpxContent: generateGPX(routePoints), // Salviamo il contenuto GPX come stringa
        routePoints,
        createdBy: auth.currentUser.uid,
        createdAt: new Date(),
        participants: [],
        status: 'active'
      };
      
      console.log('EventData da salvare:', eventData);
      const docRef = await addDoc(collection(db, 'events'), eventData);
      console.log('Evento salvato con ID:', docRef.id);
      
      Alert.alert(
        'Evento Creato!',
        'Il tuo evento di trekking è stato creato con successo.',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error: any) {
      console.error('Errore durante la creazione:', error);
      console.error('Stack trace:', error.stack);
      Alert.alert('Errore', `Errore durante la creazione: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Funzione per aggiungere un punto sulla mappa
  const handleMapPress = (e: any) => {
    if (drawingMode) {
      const { latitude, longitude } = e.nativeEvent.coordinate;
      setRoutePoints(prev => [...prev, { latitude, longitude }]);
    }
  };
  // Funzione per generare il file GPX
  function generateGPX(points: { latitude: number; longitude: number }[]) {
    const gpxHeader = `<?xml version="1.0" encoding="UTF-8"?>\n<gpx version="1.1" creator="YourApp" xmlns="http://www.topografix.com/GPX/1/1">\n<trk><name>Percorso Evento</name><trkseg>`;
    const gpxPoints = points.map(p => `<trkpt lat="${p.latitude}" lon="${p.longitude}"></trkpt>`).join('\n');
    const gpxFooter = `</trkseg></trk></gpx>`;
    return `${gpxHeader}\n${gpxPoints}\n${gpxFooter}`;
  }
  // Funzione per salvare il file GPX
  const handleDownloadGPX = async () => {
    if (routePoints.length < 2) {
      Alert.alert('Percorso troppo corto', 'Aggiungi almeno due punti per esportare il GPX.');
      return;
    }
    const gpx = generateGPX(routePoints);
    const fileUri = FileSystem.documentDirectory + 'percorso-evento.gpx';
    await FileSystem.writeAsStringAsync(fileUri, gpx, { encoding: FileSystem.EncodingType.UTF8 });
    Alert.alert('GPX salvato', `File salvato in: ${fileUri}`);
    // Qui puoi aggiungere logica per condividere il file
  };

  // Funzione per caricare un file GPX semplificata
  const handleLoadGPX = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Feature not available', 'GPX loading is not available on web platform.');
      return;
    }
    
    try {
      const result = await DocumentPicker.getDocumentAsync({ 
        type: '*/*', 
        copyToCacheDirectory: true
      });
      
      if (!result.assets || result.assets.length === 0) {
        Alert.alert('Nessun file selezionato', 'Seleziona un file GPX valido.');
        return;
      }
      
      const file = result.assets[0];
      const uri = file.uri;
      const fileName = file.name || 'unknown';
      
      console.log('File selezionato:', fileName);
      
      if (!fileName.toLowerCase().endsWith('.gpx')) {
        Alert.alert('File non valido', 'Seleziona un file con estensione .gpx');
        return;
      }
      
      const gpxText = await FileSystem.readAsStringAsync(uri);
      console.log('GPX content length:', gpxText.length);
      console.log('Prime 10 righe del file:', gpxText.split('\n').slice(0, 10));
      
      // Parsing ultra-semplificato per file GPX complessi
      const allPoints: { latitude: number; longitude: number }[] = [];
      
      // Cerca tutti i trkpt nel file intero (non per riga)
      const trkptMatches = gpxText.match(/<trkpt[^>]*>/g);
      
      if (trkptMatches) {
        console.log('Trovati', trkptMatches.length, 'trkpt nel file');
        
        for (const match of trkptMatches) {
          // Estrai lat e lon con regex più flessibili
          const latMatch = match.match(/lat=["']?([\d.-]+)["']?/);
          const lonMatch = match.match(/lon=["']?([\d.-]+)["']?/);
          
          if (latMatch && lonMatch) {
            const lat = parseFloat(latMatch[1]);
            const lon = parseFloat(lonMatch[1]);
            
            if (!isNaN(lat) && !isNaN(lon)) {
              allPoints.push({ latitude: lat, longitude: lon });
            }
          }
        }
      }
      
      // Se non troviamo trkpt, prova con wpt
      if (allPoints.length === 0) {
        const wptMatches = gpxText.match(/<wpt[^>]*>/g);
        
        if (wptMatches) {
          console.log('Trovati', wptMatches.length, 'wpt nel file');
          
          for (const match of wptMatches) {
            const latMatch = match.match(/lat=["']?([\d.-]+)["']?/);
            const lonMatch = match.match(/lon=["']?([\d.-]+)["']?/);
            
            if (latMatch && lonMatch) {
              const lat = parseFloat(latMatch[1]);
              const lon = parseFloat(lonMatch[1]);
              
              if (!isNaN(lat) && !isNaN(lon)) {
                allPoints.push({ latitude: lat, longitude: lon });
              }
            }
          }
        }
      }
      
      console.log('Punti trovati:', allPoints.length);
      console.log('Primi 3 punti:', allPoints.slice(0, 3));
      
      // Debug: mostra alcuni esempi di trkpt trovati
      if (trkptMatches && trkptMatches.length > 0) {
        console.log('Primo trkpt trovato:', trkptMatches[0]);
        console.log('Ultimo trkpt trovato:', trkptMatches[trkptMatches.length - 1]);
      }
      
      if (allPoints.length > 0) {
        setRoutePoints(allPoints);
        
        // Calcola il centro della mappa basato sui punti caricati
        const centerLat = allPoints.reduce((sum, point) => sum + point.latitude, 0) / allPoints.length;
        const centerLon = allPoints.reduce((sum, point) => sum + point.longitude, 0) / allPoints.length;
        
        // Calcola il delta per zoom appropriato
        const lats = allPoints.map(p => p.latitude);
        const lons = allPoints.map(p => p.longitude);
        const latDelta = (Math.max(...lats) - Math.min(...lats)) * 1.2; // 20% di margine
        const lonDelta = (Math.max(...lons) - Math.min(...lons)) * 1.2;
        
        // Aggiorna il centro della mappa
        setMapCenter({
          latitude: centerLat,
          longitude: centerLon,
          latitudeDelta: Math.max(latDelta, 0.01), // Minimo zoom
          longitudeDelta: Math.max(lonDelta, 0.01),
        });
        
        // Calcola automaticamente i dettagli dell'evento dal GPX
        let totalDistance = 0;
        let totalElevationGain = 0;
        let totalElevationLoss = 0;
        
        for (let i = 1; i < allPoints.length; i++) {
          const prevPoint = allPoints[i - 1];
          const currPoint = allPoints[i];
          
          // Calcola distanza
          const distance = calculateDistance(prevPoint.latitude, prevPoint.longitude, currPoint.latitude, currPoint.longitude);
          totalDistance += distance;
          
          // Per ora usiamo valori simulati per elevazione (in un'app reale questi verrebbero dal GPX)
          const elevationDiff = (Math.random() - 0.5) * 100; // Simula variazione di elevazione
          if (elevationDiff > 0) {
            totalElevationGain += elevationDiff;
          } else {
            totalElevationLoss += Math.abs(elevationDiff);
          }
        }
        
        // Stima la durata basata sulla distanza (4-6 km/h per escursionisti)
        const estimatedHours = Math.max(1, Math.round(totalDistance / 4));
        
        // Aggiorna i campi del form
        setFormData(prev => ({
          ...prev,
          distance: totalDistance.toFixed(1),
          elevation: Math.round(totalElevationGain).toString(),
          duration: `${estimatedHours}-${estimatedHours + 2}`,
        }));
        
        Alert.alert('GPX caricato con successo', 
          `File: ${fileName}\nSono stati caricati ${allPoints.length} punti dal file GPX.\nDistanza: ${totalDistance.toFixed(1)} km\nDislivello: +${Math.round(totalElevationGain)}m / -${Math.round(totalElevationLoss)}m\nDurata stimata: ${estimatedHours}-${estimatedHours + 2} ore`);
      } else {
        Alert.alert('Nessun punto trovato', 
          `File: ${fileName}\nIl file GPX non contiene punti tracciabili.`);
      }
    } catch (error) {
      console.error('Errore nel caricamento GPX:', error);
      Alert.alert('Errore nel caricamento', 'Errore: ' + String(error));
    }
  };
  // Funzione per caricare il GPX di esempio
  const handleLoadSampleGPX = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Feature not available', 'Sample GPX loading is not available on web platform.');
      return;
    }
    
    try {
      // GPX di esempio come stringa
      const sampleGPX = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="HikingApp" xmlns="http://www.topografix.com/GPX/1/1">
  <trk>
    <name>Mountain Trail</name>
    <trkseg>
      <trkpt lat="45.4642" lon="9.1900"></trkpt>
      <trkpt lat="45.4700" lon="9.2000"></trkpt>
      <trkpt lat="45.4750" lon="9.2100"></trkpt>
      <trkpt lat="45.4800" lon="9.2200"></trkpt>
      <trkpt lat="45.4850" lon="9.2300"></trkpt>
      <trkpt lat="45.4900" lon="9.2400"></trkpt>
    </trkseg>
  </trk>
</gpx>`;
      
      console.log('Caricamento GPX di esempio...');
      
      // Parsing ultra-semplificato
      const allPoints: { latitude: number; longitude: number }[] = [];
      
      // Dividi il testo in righe e cerca trkpt
      const lines = sampleGPX.split('\n');
      
      for (const line of lines) {
        if (line.includes('<trkpt')) {
          const latMatch = line.match(/lat="([\d.-]+)"/);
          const lonMatch = line.match(/lon="([\d.-]+)"/);
          
          if (latMatch && lonMatch) {
            const lat = parseFloat(latMatch[1]);
            const lon = parseFloat(lonMatch[1]);
            
            if (!isNaN(lat) && !isNaN(lon)) {
              allPoints.push({ latitude: lat, longitude: lon });
            }
          }
        }
      }
      
      console.log('Punti trovati:', allPoints.length);
      
      if (allPoints.length > 0) {
        setRoutePoints(allPoints);
        
        // Calcola il centro della mappa basato sui punti caricati
        const centerLat = allPoints.reduce((sum, point) => sum + point.latitude, 0) / allPoints.length;
        const centerLon = allPoints.reduce((sum, point) => sum + point.longitude, 0) / allPoints.length;
        
        // Calcola il delta per zoom appropriato
        const lats = allPoints.map(p => p.latitude);
        const lons = allPoints.map(p => p.longitude);
        const latDelta = (Math.max(...lats) - Math.min(...lats)) * 1.2;
        const lonDelta = (Math.max(...lons) - Math.min(...lons)) * 1.2;
        
        // Aggiorna il centro della mappa
        setMapCenter({
          latitude: centerLat,
          longitude: centerLon,
          latitudeDelta: Math.max(latDelta, 0.01),
          longitudeDelta: Math.max(lonDelta, 0.01),
        });
        
        // Calcola automaticamente i dettagli dell'evento dal GPX
        let totalDistance = 0;
        let totalElevationGain = 0;
        let totalElevationLoss = 0;
        
        for (let i = 1; i < allPoints.length; i++) {
          const prevPoint = allPoints[i - 1];
          const currPoint = allPoints[i];
          
          // Calcola distanza
          const distance = calculateDistance(prevPoint.latitude, prevPoint.longitude, currPoint.latitude, currPoint.longitude);
          totalDistance += distance;
          
          // Per ora usiamo valori simulati per elevazione (in un'app reale questi verrebbero dal GPX)
          const elevationDiff = (Math.random() - 0.5) * 100; // Simula variazione di elevazione
          if (elevationDiff > 0) {
            totalElevationGain += elevationDiff;
          } else {
            totalElevationLoss += Math.abs(elevationDiff);
          }
        }
        
        // Stima la durata basata sulla distanza (4-6 km/h per escursionisti)
        const estimatedHours = Math.max(1, Math.round(totalDistance / 4));
        
        // Aggiorna i campi del form
        setFormData(prev => ({
          ...prev,
          distance: totalDistance.toFixed(1),
          elevation: Math.round(totalElevationGain).toString(),
          duration: `${estimatedHours}-${estimatedHours + 2}`,
        }));
        
        Alert.alert('GPX di esempio caricato', 
          `Sono stati caricati ${allPoints.length} punti dal file GPX di esempio.\nDistanza: ${totalDistance.toFixed(1)} km\nDislivello: +${Math.round(totalElevationGain)}m / -${Math.round(totalElevationLoss)}m\nDurata stimata: ${estimatedHours}-${estimatedHours + 2} ore`);
      } else {
        Alert.alert('Nessun punto trovato nel GPX di esempio');
      }
    } catch (error) {
      console.error('Errore nel caricamento GPX di esempio:', error);
      Alert.alert('Errore nel caricamento GPX di esempio', 'Errore: ' + String(error));
    }
  };
  // Funzione per cancellare l'ultimo punto
  const handleRemoveLastPoint = () => {
    if (Platform.OS === 'web') {
      Alert.alert('Feature not available', 'Route editing is not available on web platform.');
      return;
    }
    
    if (routePoints.length > 0) {
      setRoutePoints(routePoints.slice(0, -1));
    }
  };



  // Funzione per calcolare la distanza tra due punti
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Raggio della Terra in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + 
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Funzione per calcolare il bearing (direzione)
  const calculateBearing = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const lat1Rad = lat1 * Math.PI / 180;
    const lat2Rad = lat2 * Math.PI / 180;
    
    const y = Math.sin(dLon) * Math.cos(lat2Rad);
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - 
              Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);
    
    let bearing = Math.atan2(y, x) * 180 / Math.PI;
    return (bearing + 360) % 360;
  };

  // Funzione per ottenere indicazioni vocali
  const getVoiceDirection = (bearing: number, distance: number) => {
    let direction = '';
    if (bearing >= 315 || bearing < 45) direction = 'Nord';
    else if (bearing >= 45 && bearing < 135) direction = 'Est';
    else if (bearing >= 135 && bearing < 225) direction = 'Sud';
    else direction = 'Ovest';
    
    let distanceText = '';
    if (distance < 0.1) distanceText = 'a pochi metri';
    else if (distance < 1) distanceText = `a ${(distance * 1000).toFixed(0)} metri`;
    else distanceText = `a ${distance.toFixed(1)} chilometri`;
    
    return `Procedi verso ${direction} ${distanceText}`;
  };

  // Funzione per simulare la posizione dell'utente
  const simulateUserLocation = () => {
    if (routePoints.length === 0) return;
    
    // Simula la posizione dell'utente vicino al primo punto
    const firstPoint = routePoints[0];
    const offset = 0.001; // Piccolo offset per simulare movimento
    setUserLocation({
      latitude: firstPoint.latitude + (Math.random() - 0.5) * offset,
      longitude: firstPoint.longitude + (Math.random() - 0.5) * offset
    });
  };

  // Funzione per avviare la navigazione guidata
  const startNavigation = () => {
    if (Platform.OS === 'web') {
      Alert.alert('Feature not available', 'Navigation is not available on web platform.');
      return;
    }
    
    if (routePoints.length < 2) {
      Alert.alert('Percorso insufficiente', 'Aggiungi almeno 2 punti per la navigazione.');
      return;
    }
    
    setNavigationMode(true);
    setCurrentStep(0);
    simulateUserLocation();
    
    Alert.alert('Navigazione avviata', 'La mappa ti guiderà lungo il percorso!');
  };

  // Funzione per fermare la navigazione
  const stopNavigation = () => {
    if (Platform.OS === 'web') {
      return;
    }
    
    setNavigationMode(false);
    setCurrentStep(0);
    setUserLocation(null);
    Alert.alert('Navigazione fermata', 'La guida è stata disattivata.');
  };

  // Imposto la data di oggi come default solo al primo render
  useEffect(() => {
    if (!formData.date) {
      setFormData(prev => ({ ...prev, date: getToday() }));
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Event</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Image Upload */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Event Image</Text>
          <TouchableOpacity style={styles.imageUpload} onPress={handleImageSelect}>
            {selectedImage ? (
              <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Camera size={32} color="#9CA3AF" />
                <Text style={styles.imagePlaceholderText}>Add Event Photo</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Event Title *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter event title"
              value={formData.title}
              onChangeText={(value) => handleInputChange('title', value)}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Location *</Text>
            <View style={styles.inputWithIcon}>
              <MapPin size={20} color="#6B7280" />
              <TextInput
                style={styles.textInputWithIcon}
                placeholder="Enter location"
                value={formData.location}
                onChangeText={(value) => handleInputChange('location', value)}
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          <View style={[styles.inputGroup, { marginBottom: 20 }]}> 
            <Text style={styles.inputLabel}>Data *</Text>
            <TouchableOpacity 
              style={[styles.inputWithIcon, { borderColor: showDatePicker ? '#22C55E' : '#D1D5DB', borderWidth: 2 }]}
              onPress={() => {
                setDatePickerMode('date');
                setShowDatePicker(true);
              }}
              activeOpacity={0.7}
            >
                <Calendar size={20} color="#6B7280" />
              <Text style={[styles.textInputWithIcon, { paddingVertical: 8, color: formData.date ? '#111827' : '#9CA3AF' }]}> 
                {formData.date || 'GG/MM/AAAA'}
              </Text>
            </TouchableOpacity>
            {showDatePicker && datePickerMode === 'date' && (
              <DateTimePicker
                value={new Date()}
                mode="date"
                display="default"
                onChange={handleDateChange}
                locale="it-IT"
                />
            )}
            {/* Card di selezione rapida */}
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 8, justifyContent: 'center' }}>
              <TouchableOpacity onPress={() => handleInputChange('date', getToday())} style={{ backgroundColor: '#F3F4F6', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#D1D5DB' }}>
                <Text style={{ color: '#111827', fontWeight: '600' }}>Oggi</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleInputChange('date', getTomorrow())} style={{ backgroundColor: '#F3F4F6', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#D1D5DB' }}>
                <Text style={{ color: '#111827', fontWeight: '600' }}>Domani</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleInputChange('date', getNextSaturday())} style={{ backgroundColor: '#F3F4F6', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#D1D5DB' }}>
                <Text style={{ color: '#111827', fontWeight: '600' }}>Prossimo Sabato</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Ora *</Text>
            <TouchableOpacity 
              style={[styles.inputWithIcon, { borderColor: showTimePicker ? '#22C55E' : '#D1D5DB', borderWidth: 2 }]}
              onPress={() => {
                setDatePickerMode('time');
                setShowTimePicker(true);
              }}
              activeOpacity={0.7}
            >
              <Clock size={20} color="#6B7280" />
              <Text style={[styles.textInputWithIcon, { paddingVertical: 8, color: formData.time ? '#111827' : '#9CA3AF' }]}> 
                {formData.time || 'HH:MM AM/PM'}
              </Text>
            </TouchableOpacity>
            {showTimePicker && datePickerMode === 'time' && (
              <DateTimePicker
                value={new Date()}
                mode="time"
                display="default"
                onChange={handleTimeChange}
                locale="it-IT"
              />
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description *</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Describe your hiking event..."
              value={formData.description}
              onChangeText={(value) => handleInputChange('description', value)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* Event Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Event Details</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Difficulty Level</Text>
            <View style={styles.difficultySelector}>
              {difficulties.map((difficulty) => (
                <TouchableOpacity
                  key={difficulty}
                  style={[
                    styles.difficultyOption,
                    formData.difficulty === difficulty && styles.selectedDifficulty,
                    { minWidth: 90, marginHorizontal: 2, alignItems: 'center', justifyContent: 'center' }
                  ]}
                  onPress={() => handleInputChange('difficulty', difficulty)}
                >
                  <Text
                    style={[
                      styles.difficultyText,
                      formData.difficulty === difficulty && styles.selectedDifficultyText,
                      { fontSize: 16, fontWeight: '700', textAlign: 'center' }
                    ]}
                  >
                    {difficulty}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.inputLabel}>Max partecipanti *</Text>
              <View style={styles.inputWithIcon}>
                <Users size={20} color="#6B7280" />
                <TextInput
                  style={styles.textInputWithIcon}
                  placeholder="15"
                  value={formData.maxParticipants}
                  onChangeText={(value) => handleInputChange('maxParticipants', value)}
                  keyboardType="numeric"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.inputLabel}>Durata (ore)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="4-6"
                value={formData.duration}
                onChangeText={(value) => handleInputChange('duration', value)}
                keyboardType="numeric"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.inputLabel}>Distanza (km)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="8.2"
                value={formData.distance}
                onChangeText={(value) => handleInputChange('distance', value)}
                keyboardType="numeric"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.inputLabel}>Dislivello (m)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="2400"
                value={formData.elevation}
                onChangeText={(value) => handleInputChange('elevation', value)}
                keyboardType="numeric"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Meeting Point</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Trailhead parking lot"
              value={formData.meetingPoint}
              onChangeText={(value) => handleInputChange('meetingPoint', value)}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Equipment Needed</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="List required equipment (one per line)..."
              value={formData.equipment}
              onChangeText={(value) => handleInputChange('equipment', value)}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* Percorso sulla mappa */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Percorso sulla mappa</Text>

          {Platform.OS !== 'web' ? (
            <>
              {/* Mappa */}
              <View style={{ height: 300, borderRadius: 12, overflow: 'hidden', marginBottom: 16, borderWidth: 1, borderColor: '#E5E7EB', position: 'relative' }}>
                {/* Controlli di zoom */}
                <View style={{ 
                  position: 'absolute', 
                  top: 10, 
                  right: 10, 
                  zIndex: 10,
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: 8,
                  padding: 4
                }}>
                  <TouchableOpacity 
                    style={{ 
                      backgroundColor: '#FFFFFF', 
                      width: 40, 
                      height: 40, 
                      borderRadius: 8, 
                      justifyContent: 'center', 
                      alignItems: 'center',
                      marginBottom: 4,
                      borderWidth: 1,
                      borderColor: '#E5E7EB'
                    }}
                    onPress={() => {
                      setMapZoom(prev => Math.min(prev + 1, 20));
                      setMapCenter(prev => ({
                        ...prev,
                        latitudeDelta: prev.latitudeDelta * 0.5,
                        longitudeDelta: prev.longitudeDelta * 0.5
                      }));
                    }}
                  >
                    <Text style={{ fontSize: 18, fontWeight: '700', color: '#374151' }}>+</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={{ 
                      backgroundColor: '#FFFFFF', 
                      width: 40, 
                      height: 40, 
                      borderRadius: 8, 
                      justifyContent: 'center', 
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: '#E5E7EB'
                    }}
                    onPress={() => {
                      setMapZoom(prev => Math.max(prev - 1, 5));
                      setMapCenter(prev => ({
                        ...prev,
                        latitudeDelta: prev.latitudeDelta * 2,
                        longitudeDelta: prev.longitudeDelta * 2
                      }));
                    }}
                  >
                    <Text style={{ fontSize: 18, fontWeight: '700', color: '#374151' }}>-</Text>
                  </TouchableOpacity>
                </View>
                
                {/* Indicatore modalità disegno */}
                {drawingMode && (
                  <View style={{ 
                    position: 'absolute', 
                    top: 10, 
                    left: 10, 
                    zIndex: 10,
                    backgroundColor: '#DC2626',
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 20
                  }}>
                    <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '700' }}>
                      ✏️ Disegno attivo
                    </Text>
                  </View>
                )}
                
                {/* Pannello di navigazione */}
                {navigationMode && userLocation && routePoints[currentStep] && (
                  <View style={{ 
                    position: 'absolute', 
                    top: 60, 
                    left: 10, 
                    right: 10, 
                    zIndex: 10,
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: 12,
                    padding: 16,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 4,
                    elevation: 5
                  }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827' }}>
                        🧭 Navigazione attiva
                      </Text>
                      <Text style={{ fontSize: 14, color: '#6B7280' }}>
                        Passo {currentStep + 1}/{routePoints.length}
                      </Text>
                    </View>
                    
                    <Text style={{ fontSize: 14, color: '#374151', marginBottom: 8 }}>
                      {getVoiceDirection(
                        calculateBearing(userLocation.latitude, userLocation.longitude, routePoints[currentStep].latitude, routePoints[currentStep].longitude),
                        calculateDistance(userLocation.latitude, userLocation.longitude, routePoints[currentStep].latitude, routePoints[currentStep].longitude)
                      )}
                    </Text>
                    
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <TouchableOpacity 
                        style={{ 
                          backgroundColor: '#EF4444', 
                          paddingHorizontal: 12, 
                          paddingVertical: 6, 
                          borderRadius: 6 
                        }}
                        onPress={stopNavigation}
                      >
                        <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '600' }}>
                          Ferma
                        </Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={{ 
                          backgroundColor: '#10B981', 
                          paddingHorizontal: 12, 
                          paddingVertical: 6, 
                          borderRadius: 6 
                        }}
                        onPress={() => {
                          if (currentStep < routePoints.length - 1) {
                            setCurrentStep(currentStep + 1);
                            simulateUserLocation();
                          } else {
                            Alert.alert('Percorso completato!', 'Hai raggiunto la destinazione finale.');
                            stopNavigation();
                          }
                        }}
                      >
                        <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '600' }}>
                          Prossimo
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
                
                {MapView && (
                  <MapView
                    style={{ flex: 1 }}
                    region={mapCenter}
                    onPress={handleMapPress}
                    key={`map-${routePoints.length}-${mapCenter.latitude.toFixed(4)}-${mapType}`}
                    mapType={mapType}
                    showsTraffic={false}
                    showsBuildings={true}
                    showsIndoors={true}
                  >
                    {/* Mostra i punti del percorso */}
                    {routePoints.map((point, index) => (
                      <Marker 
                        key={`point-${index}`} 
                        coordinate={point}
                        title={`Punto ${index + 1}`}
                        description={`${point.latitude.toFixed(4)}, ${point.longitude.toFixed(4)}`}
                        pinColor={index === 0 ? "#FFFFFF" : index === routePoints.length - 1 ? "#00FF00" : "#FFFF00"}
                      />
                    ))}
                    
                    {/* Mostra la linea del percorso se ci sono almeno 2 punti */}
                    {routePoints.length > 1 && (
                      <Polyline
                        coordinates={routePoints}
                        strokeColor="#FFFFFF"
                        strokeWidth={8}
                        lineDashPattern={[15, 8]}
                        zIndex={1}
                      />
                    )}
                    
                    {/* Marker per la posizione dell'utente in modalità navigazione */}
                    {navigationMode && userLocation && (
                      <Marker
                        coordinate={userLocation}
                        title="La tua posizione"
                        description="Sei qui"
                        pinColor="#3B82F6"
                      />
                    )}
                    
                    {/* Linea di navigazione verso il prossimo punto */}
                    {navigationMode && userLocation && routePoints[currentStep] && (
                      <Polyline
                        coordinates={[userLocation, routePoints[currentStep]]}
                        strokeColor="#F59E0B"
                        strokeWidth={4}
                        lineDashPattern={[5, 5]}
                        zIndex={2}
                      />
                    )}
                  </MapView>
                )}
              </View>
              
              {/* Controlli */}
              <View style={{ gap: 8 }}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity 
                    style={{ 
                      backgroundColor: '#3B82F6', 
                      padding: 12, 
                      borderRadius: 8, 
                      alignItems: 'center', 
                      flex: 1 
                    }} 
                    onPress={handleLoadGPX}
                  >
                    <Text style={{ color: '#fff', fontWeight: '700' }}>
                      Carica GPX
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={{ 
                      backgroundColor: '#F59E0B', 
                      padding: 12, 
                      borderRadius: 8, 
                      alignItems: 'center', 
                      flex: 1 
                    }} 
                    onPress={() => {
                      const types: ('standard' | 'satellite' | 'hybrid')[] = ['standard', 'satellite', 'hybrid'];
                      const currentIndex = types.indexOf(mapType);
                      const nextIndex = (currentIndex + 1) % types.length;
                      setMapType(types[nextIndex]);
                      Alert.alert('Tipo mappa cambiato', `Mappa ora in modalità: ${types[nextIndex]}`);
                    }}
                  >
                    <Text style={{ color: '#fff', fontWeight: '700' }}>
                      Cambia mappa
                    </Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity 
                  style={{ 
                    backgroundColor: '#EF4444', 
                    padding: 12, 
                    borderRadius: 8, 
                    alignItems: 'center', 
                    marginTop: 8
                  }} 
                  onPress={() => {
                    setRoutePoints([]);
                    Alert.alert('Percorso pulito', 'Tutti i punti del percorso sono stati rimossi.');
                  }}
                >
                  <Text style={{ color: '#fff', fontWeight: '700' }}>
                    Pulisci percorso
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            /* Web fallback */
            <View style={{ 
              height: 300, 
              borderRadius: 12, 
              backgroundColor: '#F3F4F6', 
              justifyContent: 'center', 
              alignItems: 'center', 
              marginBottom: 16, 
              borderWidth: 1, 
              borderColor: '#E5E7EB' 
            }}>
              <MapPin size={48} color="#9CA3AF" />
              <Text style={{ 
                fontSize: 18, 
                fontWeight: '600', 
                color: '#6B7280', 
                marginTop: 12, 
                textAlign: 'center' 
              }}>
                Map feature not available on web
              </Text>
              <Text style={{ 
                fontSize: 14, 
                color: '#9CA3AF', 
                marginTop: 8, 
                textAlign: 'center',
                paddingHorizontal: 20
              }}>
                Please use the mobile app to access map functionality and route planning
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomBar}>
        <TouchableOpacity 
          style={[styles.createButton, loading && styles.createButtonDisabled]} 
          onPress={handleCreateEvent}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Plus size={20} color="#FFFFFF" />
          )}
          <Text style={styles.createButtonText}>
            {loading ? 'Creazione...' : 'Create Event'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  imageUpload: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  selectedImage: {
    width: '100%',
    height: 200,
  },
  imagePlaceholder: {
    height: 200,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  imagePlaceholderText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 8,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  textInputWithIcon: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  halfWidth: {
    flex: 1,
  },
  difficultySelector: {
    flexDirection: 'row',
    gap: 12,
  },
  difficultyOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  selectedDifficulty: {
    backgroundColor: '#22C55E',
    borderColor: '#22C55E',
  },
  difficultyText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  selectedDifficultyText: {
    color: '#FFFFFF',
  },
  bottomBar: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  createButton: {
    backgroundColor: '#22C55E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  createButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  createButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
});

