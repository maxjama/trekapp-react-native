import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Star, Navigation, Bookmark, Share } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function ExploreScreen() {
  const [selectedCategory, setSelectedCategory] = useState('Popular');

  const categories = ['Popular', 'Nearby', 'Easy', 'Challenging', 'Scenic'];

  const trails = [
    {
      id: 1,
      name: 'Eagle Peak Trail',
      location: 'Yosemite National Park',
      distance: '8.2 miles',
      elevation: '2,400 ft',
      difficulty: 'Hard',
      rating: 4.8,
      reviews: 324,
      image: 'https://images.pexels.com/photos/618833/pexels-photo-618833.jpeg?auto=compress&cs=tinysrgb&w=400',
      estimatedTime: '4-6 hours',
      features: ['Waterfall', 'Summit Views', 'Wildlife'],
    },
    {
      id: 2,
      name: 'Meadow Loop',
      location: 'Golden Gate Park',
      distance: '3.1 miles',
      elevation: '200 ft',
      difficulty: 'Easy',
      rating: 4.5,
      reviews: 156,
      image: 'https://images.pexels.com/photos/957024/pexels-photo-957024.jpeg?auto=compress&cs=tinysrgb&w=400',
      estimatedTime: '1-2 hours',
      features: ['Flowers', 'Easy Walk', 'Family Friendly'],
    },
    {
      id: 3,
      name: 'Coastal Ridge',
      location: 'Big Sur',
      distance: '6.5 miles',
      elevation: '1,800 ft',
      difficulty: 'Moderate',
      rating: 4.9,
      reviews: 289,
      image: 'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=400',
      estimatedTime: '3-4 hours',
      features: ['Ocean Views', 'Cliffs', 'Photo Spots'],
    },
  ];

  const featuredTrail = trails[0];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Explore Trails</Text>
          <Text style={styles.subtitle}>Discover amazing hiking destinations</Text>
        </View>

        {/* Featured Trail */}
        <View style={styles.featuredSection}>
          <Text style={styles.sectionTitle}>Featured Trail</Text>
          <TouchableOpacity style={styles.featuredCard}>
            <Image source={{ uri: featuredTrail.image }} style={styles.featuredImage} />
            <View style={styles.featuredOverlay}>
              <View style={styles.featuredContent}>
                <Text style={styles.featuredName}>{featuredTrail.name}</Text>
                <View style={styles.featuredMeta}>
                  <MapPin size={16} color="#FFFFFF" />
                  <Text style={styles.featuredLocation}>{featuredTrail.location}</Text>
                </View>
                <View style={styles.featuredStats}>
                  <Text style={styles.featuredStat}>{featuredTrail.distance}</Text>
                  <Text style={styles.featuredStat}>•</Text>
                  <Text style={styles.featuredStat}>{featuredTrail.difficulty}</Text>
                  <Text style={styles.featuredStat}>•</Text>
                  <View style={styles.ratingContainer}>
                    <Star size={14} color="#FCD34D" fill="#FCD34D" />
                    <Text style={styles.featuredStat}>{featuredTrail.rating}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.featuredActions}>
                <TouchableOpacity style={styles.actionButton}>
                  <Bookmark size={20} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Share size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categorySection}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryTab,
                selectedCategory === category && styles.activeCategoryTab,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryTabText,
                  selectedCategory === category && styles.activeCategoryTabText,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Trail List */}
        <View style={styles.trailsSection}>
          <Text style={styles.sectionTitle}>Popular Trails</Text>
          {trails.map((trail) => (
            <TouchableOpacity key={trail.id} style={styles.trailCard}>
              <Image source={{ uri: trail.image }} style={styles.trailImage} />
              <View style={styles.trailContent}>
                <View style={styles.trailHeader}>
                  <Text style={styles.trailName}>{trail.name}</Text>
                  <TouchableOpacity style={styles.bookmarkButton}>
                    <Bookmark size={16} color="#6B7280" />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.trailMeta}>
                  <MapPin size={14} color="#6B7280" />
                  <Text style={styles.trailLocation}>{trail.location}</Text>
                </View>

                <View style={styles.trailStats}>
                  <Text style={styles.trailStat}>{trail.distance}</Text>
                  <Text style={styles.statSeparator}>•</Text>
                  <Text style={styles.trailStat}>{trail.elevation} gain</Text>
                  <Text style={styles.statSeparator}>•</Text>
                  <Text style={styles.trailStat}>{trail.estimatedTime}</Text>
                </View>

                <View style={styles.trailFeatures}>
                  {trail.features.map((feature, index) => (
                    <View key={index} style={styles.featureTag}>
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.trailFooter}>
                  <View style={styles.rating}>
                    <Star size={16} color="#FCD34D" fill="#FCD34D" />
                    <Text style={styles.ratingText}>{trail.rating}</Text>
                    <Text style={styles.reviewCount}>({trail.reviews} reviews)</Text>
                  </View>
                  <View style={[
                    styles.difficultyBadge,
                    trail.difficulty === 'Easy' ? styles.easyBadge :
                    trail.difficulty === 'Moderate' ? styles.moderateBadge : styles.hardBadge
                  ]}>
                    <Text style={styles.difficultyText}>{trail.difficulty}</Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.navigationButton}>
                  <Navigation size={16} color="#FFFFFF" />
                  <Text style={styles.navigationText}>Start Navigation</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
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
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  featuredSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  featuredCard: {
    borderRadius: 20,
    overflow: 'hidden',
    height: 220,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 20,
    justifyContent: 'space-between',
  },
  featuredContent: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  featuredName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  featuredMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  featuredLocation: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  featuredStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featuredStat: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  featuredActions: {
    flexDirection: 'row',
    gap: 12,
    alignSelf: 'flex-end',
  },
  actionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categorySection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  categoryTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    marginRight: 12,
  },
  activeCategoryTab: {
    backgroundColor: '#22C55E',
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeCategoryTabText: {
    color: '#FFFFFF',
  },
  trailsSection: {
    paddingHorizontal: 20,
  },
  trailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  trailImage: {
    width: '100%',
    height: 180,
  },
  trailContent: {
    padding: 20,
  },
  trailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  trailName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  bookmarkButton: {
    padding: 4,
  },
  trailMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  trailLocation: {
    fontSize: 14,
    color: '#6B7280',
  },
  trailStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  trailStat: {
    fontSize: 14,
    color: '#374151',
  },
  statSeparator: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  trailFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  featureTag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  featureText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  trailFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  reviewCount: {
    fontSize: 14,
    color: '#6B7280',
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
  navigationButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  navigationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});