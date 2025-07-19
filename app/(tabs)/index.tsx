import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { MapPin, Clock, Users, TrendingUp } from 'lucide-react-native';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { auth } from '../../firebaseConfig';

export default function HomeScreen() {
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);
  const [loadingName, setLoadingName] = useState(true);

  useEffect(() => {
    const fetchName = async () => {
      if (!auth.currentUser) return;
      setLoadingName(true);
      try {
        const db = getFirestore();
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          setUserName(userDoc.data().name);
        } else {
          setUserName(null);
        }
      } catch (e) {
        setUserName(null);
      } finally {
        setLoadingName(false);
      }
    };
    fetchName();
  }, []);

  const featuredEvents = [
    {
      id: 1,
      title: 'Sunrise Peak Trail',
      location: 'Blue Ridge Mountains',
      date: 'Tomorrow, 6:00 AM',
      difficulty: 'Moderate',
      participants: 12,
      maxParticipants: 15,
      image: 'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
    {
      id: 2,
      title: 'Waterfall Discovery',
      location: 'Cascade Canyon',
      date: 'Saturday, 8:00 AM',
      difficulty: 'Easy',
      participants: 8,
      maxParticipants: 10,
      image: 'https://images.pexels.com/photos/1761279/pexels-photo-1761279.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
  ];

  const stats = [
    { 
      label: 'Trails Completed', 
      value: '24', 
      icon: <TrendingUp size={20} color="#FFFFFF" />,
      gradient: ['#22C55E', '#16A34A'] as const
    },
    { 
      label: 'Miles Hiked', 
      value: '142', 
      icon: <MapPin size={20} color="#FFFFFF" />,
      gradient: ['#3B82F6', '#2563EB'] as const
    },
    { 
      label: 'Events Joined', 
      value: '18', 
      icon: <Users size={20} color="#FFFFFF" />,
      gradient: ['#F59E0B', '#D97706'] as const
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              {loadingName ? '...' : userName ? `Ciao, ${userName}!` : 'Ciao!'}
            </Text>
            <Text style={styles.subGreeting}>Ready for your next adventure?</Text>
          </View>
          <Image
            source={{ uri: 'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=100' }}
            style={styles.profileImage}
          />
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <LinearGradient
              key={index}
              colors={stat.gradient}
              style={styles.statCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.statContent}>
                {stat.icon}
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            </LinearGradient>
          ))}
        </View>

        {/* Featured Events */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Events</Text>
            <TouchableOpacity onPress={() => router.push('/events')}>
              <Text style={styles.seeAllButton}>See All</Text>
            </TouchableOpacity>
          </View>
          {featuredEvents.map((event) => (
            <TouchableOpacity 
              key={event.id} 
              style={styles.eventCard}
              onPress={() => router.push({
                pathname: '/event-details',
                params: {
                  title: event.title,
                  location: event.location,
                  date: event.date,
                  time: '7:00 AM',
                  difficulty: event.difficulty,
                  participants: event.participants.toString(),
                  maxParticipants: event.maxParticipants.toString(),
                  description: 'Join us for an amazing hiking adventure with breathtaking views and great company!',
                  organizer: 'Adventure Guide',
                  image: event.image,
                }
              })}
            >
              <Image source={{ uri: event.image }} style={styles.eventImage} />
              <View style={styles.eventContent}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <View style={styles.eventMeta}>
                  <View style={styles.metaItem}>
                    <MapPin size={14} color="#6B7280" />
                    <Text style={styles.metaText}>{event.location}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Clock size={14} color="#6B7280" />
                    <Text style={styles.metaText}>{event.date}</Text>
                  </View>
                </View>
                <View style={styles.eventFooter}>
                  <View style={styles.participantInfo}>
                    <Users size={14} color="#22C55E" />
                    <Text style={styles.participantText}>
                      {event.participants}/{event.maxParticipants} joined
                    </Text>
                  </View>
                  <View style={[styles.difficultyBadge, 
                    event.difficulty === 'Easy' ? styles.easyBadge : 
                    event.difficulty === 'Moderate' ? styles.moderateBadge : styles.hardBadge
                  ]}>
                    <Text style={styles.difficultyText}>{event.difficulty}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/create-event')}>
              <Text style={styles.actionButtonText}>Create Event</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={() => router.push('/explore')}
            >
              <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>Explore Trails</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  subGreeting: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statContent: {
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  seeAllButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#22C55E',
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  eventImage: {
    width: '100%',
    height: 160,
  },
  eventContent: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  eventMeta: {
    gap: 8,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    color: '#6B7280',
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  participantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  participantText: {
    fontSize: 14,
    color: '#22C55E',
    fontWeight: '500',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  easyBadge: {
    backgroundColor: '#DCFCE7',
  },
  moderateBadge: {
    backgroundColor: '#FEF3C7',
  },
  hardBadge: {
    backgroundColor: '#FEE2E2',
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#22C55E',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#22C55E',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButtonText: {
    color: '#22C55E',
  },
});