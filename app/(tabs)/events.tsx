import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Filter, Plus, MapPin, Clock, Users, Calendar, Star } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function EventsScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');

  const filters = ['All', 'Easy', 'Moderate', 'Hard'];

  const events = [
    {
      title: 'Mountain Peak Challenge',
      location: 'Rocky Mountains',
      date: '2024-02-15',
      time: '7:00 AM',
      difficulty: 'Hard',
      participants: 8,
      maxParticipants: 12,
      description: 'A challenging hike to the summit with breathtaking views and alpine lakes.',
      organizer: 'Sarah Johnson',
      image: 'https://images.pexels.com/photos/618833/pexels-photo-618833.jpeg?auto=compress&cs=tinysrgb&w=400',
      joined: false,
      rating: 4.8,
      duration: '6-8 hours',
      distance: '12.5 km',
      elevation: '1,200m',
    },
    {
      title: 'Forest Trail Walk',
      location: 'Redwood National Park',
      date: '2024-02-16',
      time: '9:00 AM',
      difficulty: 'Easy',
      participants: 15,
      maxParticipants: 20,
      description: 'A peaceful walk through ancient redwood forests with wildlife spotting.',
      organizer: 'Mike Chen',
      image: 'https://images.pexels.com/photos/957024/pexels-photo-957024.jpeg?auto=compress&cs=tinysrgb&w=400',
      joined: true,
      rating: 4.6,
      duration: '2-3 hours',
      distance: '5.2 km',
      elevation: '150m',
    },
    {
      title: 'Coastal Cliff Adventure',
      location: 'Big Sur Coast',
      date: '2024-02-17',
      time: '6:30 AM',
      difficulty: 'Moderate',
      participants: 10,
      maxParticipants: 15,
      description: 'Spectacular coastal views and wildlife spotting along dramatic cliffs.',
      organizer: 'Emma Davis',
      image: 'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=400',
      joined: false,
      rating: 4.9,
      duration: '4-5 hours',
      distance: '8.7 km',
      elevation: '600m',
    },
    {
      title: 'Sunrise Valley Trek',
      location: 'Yosemite Valley',
      date: '2024-02-18',
      time: '5:30 AM',
      difficulty: 'Moderate',
      participants: 6,
      maxParticipants: 10,
      description: 'Early morning trek to catch the sunrise over the valley with stunning photo opportunities.',
      organizer: 'Alex Thompson',
      image: 'https://images.pexels.com/photos/1761279/pexels-photo-1761279.jpeg?auto=compress&cs=tinysrgb&w=400',
      joined: false,
      rating: 4.7,
      duration: '3-4 hours',
      distance: '6.8 km',
      elevation: '400m',
    },
  ];

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'All' || event.difficulty === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const handleCreateEvent = () => {
    router.push('/create-event');
  };

  const handleEventPress = (event: any) => {
    router.push({
      pathname: '/event-details',
      params: {
        title: event.title,
        location: event.location,
        date: event.date,
        time: event.time,
        difficulty: event.difficulty,
        participants: event.participants.toString(),
        maxParticipants: event.maxParticipants.toString(),
        description: event.description,
        organizer: event.organizer,
        image: event.image,
      }
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return '#22C55E';
      case 'Moderate': return '#F59E0B';
      case 'Hard': return '#EF4444';
      default: return '#6B7280';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Hiking Events</Text>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={handleCreateEvent}
        >
          <Plus size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Search and Filter */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Search size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search events or locations..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color="#22C55E" />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterTabs}>
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterTab,
              selectedFilter === filter && styles.activeFilterTab,
            ]}
            onPress={() => setSelectedFilter(filter)}
          >
            <Text
              style={[
                styles.filterTabText,
                selectedFilter === filter && styles.activeFilterTabText,
              ]}
            >
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Events List */}
      <ScrollView style={styles.eventsList} showsVerticalScrollIndicator={false}>
        {filteredEvents.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No events found</Text>
            <Text style={styles.emptyStateText}>Try adjusting your search or filters</Text>
          </View>
        ) : (
          filteredEvents.map((event, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.eventCard}
              onPress={() => handleEventPress(event)}
            >
              <View style={styles.cardHeader}>
                <Image source={{ uri: event.image }} style={styles.eventImage} />
                <View style={styles.imageOverlay}>
                  <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(event.difficulty) }]}>
                    <Text style={styles.difficultyText}>{event.difficulty}</Text>
                  </View>
                  {event.joined && (
                    <View style={styles.joinedBadge}>
                      <Text style={styles.joinedText}>Joined</Text>
                    </View>
                  )}
                </View>
              </View>
              
              <View style={styles.eventContent}>
                <View style={styles.eventHeader}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <View style={styles.ratingContainer}>
                    <Star size={14} color="#FCD34D" fill="#FCD34D" />
                    <Text style={styles.ratingText}>{event.rating}</Text>
                  </View>
                </View>
                
                <Text style={styles.eventDescription} numberOfLines={2}>
                  {event.description}
                </Text>
                
                <View style={styles.eventMeta}>
                  <View style={styles.metaRow}>
                    <MapPin size={16} color="#6B7280" />
                    <Text style={styles.metaText}>{event.location}</Text>
                  </View>
                  <View style={styles.metaRow}>
                    <Calendar size={16} color="#6B7280" />
                    <Text style={styles.metaText}>{event.date}</Text>
                  </View>
                  <View style={styles.metaRow}>
                    <Clock size={16} color="#6B7280" />
                    <Text style={styles.metaText}>{event.time} • {event.duration}</Text>
                  </View>
                </View>

                <View style={styles.eventStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{event.distance}</Text>
                    <Text style={styles.statLabel}>Distance</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{event.elevation}</Text>
                    <Text style={styles.statLabel}>Elevation</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{event.participants}/{event.maxParticipants}</Text>
                    <Text style={styles.statLabel}>Participants</Text>
                  </View>
                </View>

                <View style={styles.eventFooter}>
                  <Text style={styles.organizerText}>by {event.organizer}</Text>
                  <TouchableOpacity
                    style={[
                      styles.joinButton,
                      event.joined && styles.joinedButton,
                    ]}
                  >
                    <Text
                      style={[
                        styles.joinButtonText,
                        event.joined && styles.joinedButtonText,
                      ]}
                    >
                      {event.joined ? 'Joined' : 'Join'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
  },
  createButton: {
    backgroundColor: '#22C55E',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  searchSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#0F172A',
  },
  filterButton: {
    backgroundColor: '#F0FDF4',
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  filterTabs: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  filterTab: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
    marginRight: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  activeFilterTab: {
    backgroundColor: '#22C55E',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  activeFilterTabText: {
    color: '#FFFFFF',
  },
  eventsList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#94A3B8',
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
  },
  cardHeader: {
    position: 'relative',
  },
  eventImage: {
    width: '100%',
    height: 200,
  },
  imageOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  joinedBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  joinedText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  eventContent: {
    padding: 20,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    marginRight: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  eventDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 16,
  },
  eventMeta: {
    gap: 8,
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 14,
    color: '#64748B',
  },
  eventStats: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  organizerText: {
    fontSize: 14,
    color: '#64748B',
    flex: 1,
  },
  joinButton: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  joinedButton: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  joinedButtonText: {
    color: '#64748B',
  },
});