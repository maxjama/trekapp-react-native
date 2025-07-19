import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, MapPin, Calendar, Clock, Users, Star, Share, Bookmark, MessageCircle } from 'lucide-react-native';

export default function EventDetailScreen() {
  const { title, location, date, time, difficulty, participants, maxParticipants, description, organizer, image } = useLocalSearchParams();
  const router = useRouter();
  const [isJoined, setIsJoined] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Mock additional data that would come from database
  const eventDetails = {
    rating: 4.8,
    reviews: 24,
    duration: '6-8 hours',
    elevation: '2,400 ft gain',
    distance: '8.2 miles',
    meetingPoint: 'Eagle Peak Trailhead Parking',
    equipment: ['Hiking boots', 'Water (3L minimum)', 'Snacks/lunch', 'Weather protection', 'Headlamp'],
    organizerAvatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
  };

  const handleJoinEvent = () => {
    if (isJoined) {
      Alert.alert(
        'Leave Event',
        'Are you sure you want to leave this event?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Leave', 
            style: 'destructive',
            onPress: () => setIsJoined(false)
          }
        ]
      );
    } else {
      setIsJoined(true);
      Alert.alert('Success!', 'You have successfully joined this hiking event.');
    }
  };

  const handleShare = () => {
    Alert.alert('Share Event', 'Sharing functionality would be implemented here.');
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const handleContactOrganizer = () => {
    Alert.alert('Contact Organizer', `Contact ${organizer} functionality would be implemented here.`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: image as string }} style={styles.eventImage} />
          <View style={styles.imageOverlay}>
            <TouchableOpacity style={styles.backIconButton} onPress={() => router.back()}>
              <ArrowLeft size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.imageActions}>
              <TouchableOpacity 
                style={styles.actionIconButton} 
                onPress={handleBookmark}
              >
                <Bookmark 
                  size={20} 
                  color="#FFFFFF" 
                  fill={isBookmarked ? "#FFFFFF" : "none"}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionIconButton} onPress={handleShare}>
                <Share size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Event Content */}
        <View style={styles.content}>
          {/* Title and Difficulty */}
          <View style={styles.titleSection}>
            <Text style={styles.eventTitle}>{title}</Text>
            <View style={[
              styles.difficultyBadge,
              difficulty === 'Easy' ? styles.easyBadge :
              difficulty === 'Moderate' ? styles.moderateBadge : styles.hardBadge
            ]}>
              <Text style={styles.difficultyText}>{difficulty}</Text>
            </View>
          </View>

          {/* Rating */}
          <View style={styles.ratingSection}>
            <Star size={16} color="#FCD34D" fill="#FCD34D" />
            <Text style={styles.ratingText}>{eventDetails.rating}</Text>
            <Text style={styles.reviewCount}>({eventDetails.reviews} reviews)</Text>
          </View>

          {/* Event Details */}
          <View style={styles.detailsSection}>
            <View style={styles.detailRow}>
              <MapPin size={20} color="#6B7280" />
              <Text style={styles.detailText}>{location}</Text>
            </View>
            <View style={styles.detailRow}>
              <Calendar size={20} color="#6B7280" />
              <Text style={styles.detailText}>{date}</Text>
            </View>
            <View style={styles.detailRow}>
              <Clock size={20} color="#6B7280" />
              <Text style={styles.detailText}>{time} • {eventDetails.duration}</Text>
            </View>
            <View style={styles.detailRow}>
              <Users size={20} color="#6B7280" />
              <Text style={styles.detailText}>
                {participants}/{maxParticipants} participants
              </Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About this hike</Text>
            <Text style={styles.description}>{description}</Text>
          </View>

          {/* Trail Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Trail Information</Text>
            <View style={styles.trailInfoGrid}>
              <View style={styles.trailInfoItem}>
                <Text style={styles.trailInfoLabel}>Distance</Text>
                <Text style={styles.trailInfoValue}>{eventDetails.distance}</Text>
              </View>
              <View style={styles.trailInfoItem}>
                <Text style={styles.trailInfoLabel}>Elevation</Text>
                <Text style={styles.trailInfoValue}>{eventDetails.elevation}</Text>
              </View>
              <View style={styles.trailInfoItem}>
                <Text style={styles.trailInfoLabel}>Duration</Text>
                <Text style={styles.trailInfoValue}>{eventDetails.duration}</Text>
              </View>
              <View style={styles.trailInfoItem}>
                <Text style={styles.trailInfoLabel}>Meeting Point</Text>
                <Text style={styles.trailInfoValue}>{eventDetails.meetingPoint}</Text>
              </View>
            </View>
          </View>

          {/* Equipment */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What to bring</Text>
            <View style={styles.equipmentList}>
              {eventDetails.equipment.map((item, index) => (
                <View key={index} style={styles.equipmentItem}>
                  <View style={styles.equipmentBullet} />
                  <Text style={styles.equipmentText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Organizer */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Organizer</Text>
            <View style={styles.organizerCard}>
              <Image source={{ uri: eventDetails.organizerAvatar }} style={styles.organizerAvatar} />
              <View style={styles.organizerInfo}>
                <Text style={styles.organizerName}>{organizer}</Text>
                <Text style={styles.organizerTitle}>Event Organizer</Text>
              </View>
              <TouchableOpacity style={styles.contactButton} onPress={handleContactOrganizer}>
                <MessageCircle size={20} color="#22C55E" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.joinButton, isJoined && styles.joinedButton]}
          onPress={handleJoinEvent}
        >
          <Text style={[styles.joinButtonText, isJoined && styles.joinedButtonText]}>
            {isJoined ? 'Leave Event' : 'Join Event'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  imageContainer: {
    position: 'relative',
  },
  eventImage: {
    width: '100%',
    height: 300,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    paddingTop: 50,
  },
  backIconButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionIconButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    marginRight: 12,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
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
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  reviewCount: {
    fontSize: 16,
    color: '#6B7280',
  },
  detailsSection: {
    gap: 12,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailText: {
    fontSize: 16,
    color: '#374151',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
  },
  trailInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  trailInfoItem: {
    width: '47%',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
  },
  trailInfoLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  trailInfoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  equipmentList: {
    gap: 8,
  },
  equipmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  equipmentBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
  },
  equipmentText: {
    fontSize: 16,
    color: '#374151',
  },
  organizerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  organizerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  organizerInfo: {
    flex: 1,
  },
  organizerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  organizerTitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  contactButton: {
    backgroundColor: '#FFFFFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bottomBar: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  joinButton: {
    backgroundColor: '#22C55E',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  joinedButton: {
    backgroundColor: '#EF4444',
  },
  joinButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  joinedButtonText: {
    color: '#FFFFFF',
  },
});