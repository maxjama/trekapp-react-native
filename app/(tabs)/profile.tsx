import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings, MapPin, Calendar, Award, Users, Camera, CreditCard as Edit3 } from 'lucide-react-native';
import { signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { auth } from '../../firebaseConfig';
import { useState, useEffect } from 'react';

export default function ProfileScreen() {
  const achievements = [
    { id: 1, title: 'First Hike', description: 'Completed your first hiking event', icon: '🥾', earned: true },
    { id: 2, title: 'Mountain Climber', description: 'Hiked 5 mountain trails', icon: '⛰️', earned: true },
    { id: 3, title: 'Early Bird', description: 'Joined 10 sunrise hikes', icon: '🌅', earned: true },
    { id: 4, title: 'Social Butterfly', description: 'Made 20 hiking connections', icon: '🦋', earned: false },
    { id: 5, title: 'Trail Master', description: 'Completed 50 different trails', icon: '🏆', earned: false },
    { id: 6, title: 'Nature Photographer', description: 'Shared 25 trail photos', icon: '📸', earned: true },
  ];

  const recentHikes = [
    {
      id: 1,
      name: 'Eagle Peak Trail',
      date: '2024-02-10',
      image: 'https://images.pexels.com/photos/618833/pexels-photo-618833.jpeg?auto=compress&cs=tinysrgb&w=200',
      difficulty: 'Hard',
      distance: '8.2 miles',
    },
    {
      id: 2,
      name: 'Forest Trail Walk',
      date: '2024-02-08',
      image: 'https://images.pexels.com/photos/957024/pexels-photo-957024.jpeg?auto=compress&cs=tinysrgb&w=200',
      difficulty: 'Easy',
      distance: '3.1 miles',
    },
    {
      id: 3,
      name: 'Coastal Ridge',
      date: '2024-02-05',
      image: 'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=200',
      difficulty: 'Moderate',
      distance: '6.5 miles',
    },
  ];

  const stats = [
    { label: 'Trails Completed', value: '24', icon: <MapPin size={20} color="#22C55E" /> },
    { label: 'Total Distance', value: '142 mi', icon: <Award size={20} color="#3B82F6" /> },
    { label: 'Events Organized', value: '8', icon: <Calendar size={20} color="#F59E0B" /> },
    { label: 'Hiking Buddies', value: '32', icon: <Users size={20} color="#EF4444" /> },
  ];

  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [logoutSuccess, setLogoutSuccess] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!auth.currentUser) return;
      setProfileLoading(true);
      try {
        const db = getFirestore();
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          setProfile(userDoc.data());
        } else {
          setProfile(null);
        }
      } catch (e) {
        setProfile(null);
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    setLogoutLoading(true);
    setLogoutSuccess(false);
    try {
      await signOut(auth);
      setLogoutSuccess(true);
    } catch (e) {
      // Puoi gestire errori qui se vuoi
    } finally {
      setLogoutLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.settingsButton}>
            <Settings size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>
        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: 'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=200' }}
              style={styles.avatar}
            />
            <TouchableOpacity style={styles.cameraButton}>
              <Camera size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          {profileLoading ? (
            <Text style={{ fontSize: 18, color: '#888', marginBottom: 8 }}>Caricamento...</Text>
          ) : (
            <>
              <Text style={styles.name}>{profile?.name || 'Nome non disponibile'}</Text>
              <Text style={styles.username}>{auth.currentUser?.email}</Text>
              {profile?.birthDate && (
                <Text style={styles.bio}>Nato il {new Date(profile.birthDate).toLocaleDateString()}</Text>
              )}
            </>
          )}
          <TouchableOpacity style={styles.editButton}>
            <Edit3 size={16} color="#22C55E" />
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsSection}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statItem}>
              {stat.icon}
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <View style={styles.achievementsGrid}>
            {achievements.map((achievement) => (
              <TouchableOpacity
                key={achievement.id}
                style={[
                  styles.achievementCard,
                  !achievement.earned && styles.achievementLocked,
                ]}
              >
                <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                <Text style={[
                  styles.achievementTitle,
                  !achievement.earned && styles.achievementTitleLocked,
                ]}>
                  {achievement.title}
                </Text>
                <Text style={[
                  styles.achievementDescription,
                  !achievement.earned && styles.achievementDescriptionLocked,
                ]}>
                  {achievement.description}
                </Text>
                {!achievement.earned && (
                  <View style={styles.lockedOverlay}>
                    <Text style={styles.lockedText}>🔒</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Hikes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Hikes</Text>
          {recentHikes.map((hike) => (
            <TouchableOpacity key={hike.id} style={styles.hikeCard}>
              <Image source={{ uri: hike.image }} style={styles.hikeImage} />
              <View style={styles.hikeContent}>
                <Text style={styles.hikeName}>{hike.name}</Text>
                <Text style={styles.hikeDate}>{hike.date}</Text>
                <View style={styles.hikeStats}>
                  <Text style={styles.hikeDistance}>{hike.distance}</Text>
                  <View style={[
                    styles.hikeDifficultyBadge,
                    hike.difficulty === 'Easy' ? styles.easyBadge :
                    hike.difficulty === 'Moderate' ? styles.moderateBadge : styles.hardBadge
                  ]}>
                    <Text style={styles.hikeDifficultyText}>{hike.difficulty}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        {/* Logout Button */}
        <View style={{ alignItems: 'center', marginVertical: 32 }}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            disabled={logoutLoading}
          >
            <Text style={styles.logoutButtonText}>{logoutLoading ? 'Logout...' : 'Logout'}</Text>
          </TouchableOpacity>
          {logoutSuccess && <Text style={styles.logoutSuccess}>Logout effettuato!</Text>}
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
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  settingsButton: {
    padding: 8,
  },
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: '#22C55E',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 12,
  },
  bio: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#22C55E',
    borderRadius: 8,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#22C55E',
  },
  statsSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 32,
    gap: 12,
  },
  statItem: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  achievementCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  achievementLocked: {
    opacity: 0.6,
  },
  achievementIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 4,
  },
  achievementTitleLocked: {
    color: '#9CA3AF',
  },
  achievementDescription: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
  },
  achievementDescriptionLocked: {
    color: '#D1D5DB',
  },
  lockedOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  lockedText: {
    fontSize: 16,
  },
  hikeCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  hikeImage: {
    width: 80,
    height: 80,
  },
  hikeContent: {
    flex: 1,
    padding: 16,
  },
  hikeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  hikeDate: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  hikeStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hikeDistance: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  hikeDifficultyBadge: {
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
  hikeDifficultyText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 30,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 1,
  },
  logoutSuccess: {
    color: '#22C55E',
    marginTop: 12,
    fontWeight: 'bold',
    fontSize: 16,
  },
});