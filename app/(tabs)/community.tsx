import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, MessageCircle, Share, Camera, MapPin, Calendar } from 'lucide-react-native';

export default function CommunityScreen() {
  const [likedPosts, setLikedPosts] = useState<number[]>([]);

  const posts = [
    {
      id: 1,
      user: {
        name: 'Sarah Johnson',
        avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
        badges: ['Expert Hiker'],
      },
      content: 'Just completed the most amazing sunrise hike at Eagle Peak! The views were absolutely breathtaking. 🏔️✨',
      image: 'https://images.pexels.com/photos/618833/pexels-photo-618833.jpeg?auto=compress&cs=tinysrgb&w=400',
      location: 'Eagle Peak Trail',
      timestamp: '2 hours ago',
      likes: 42,
      comments: 8,
      event: 'Mountain Peak Challenge',
    },
    {
      id: 2,
      user: {
        name: 'Mike Chen',
        avatar: 'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=100',
        badges: ['Nature Photographer'],
      },
      content: 'Captured this beautiful shot during our forest walk yesterday. Nature never fails to amaze me! 🌲📸',
      image: 'https://images.pexels.com/photos/957024/pexels-photo-957024.jpeg?auto=compress&cs=tinysrgb&w=400',
      location: 'Redwood National Park',
      timestamp: '5 hours ago',
      likes: 38,
      comments: 12,
      event: 'Forest Trail Walk',
    },
    {
      id: 3,
      user: {
        name: 'Emma Davis',
        avatar: 'https://images.pexels.com/photos/1382731/pexels-photo-1382731.jpeg?auto=compress&cs=tinysrgb&w=100',
        badges: ['Trail Guide'],
      },
      content: 'Looking for hiking buddies for this weekend! Planning to explore some new coastal trails. Who\'s in? 🌊',
      image: 'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=400',
      location: 'Big Sur Coast',
      timestamp: '1 day ago',
      likes: 56,
      comments: 15,
      event: null,
    },
  ];

  const toggleLike = (postId: number) => {
    setLikedPosts(prev =>
      prev.includes(postId)
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Community</Text>
        <TouchableOpacity style={styles.cameraButton}>
          <Camera size={20} color="#22C55E" />
        </TouchableOpacity>
      </View>

      {/* Create Post */}
      <View style={styles.createPostSection}>
        <Image
          source={{ uri: 'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=100' }}
          style={styles.userAvatar}
        />
        <TouchableOpacity style={styles.createPostInput}>
          <Text style={styles.createPostPlaceholder}>Share your hiking experience...</Text>
        </TouchableOpacity>
      </View>

      {/* Posts Feed */}
      <ScrollView style={styles.feed} showsVerticalScrollIndicator={false}>
        {posts.map((post) => (
          <View key={post.id} style={styles.postCard}>
            {/* Post Header */}
            <View style={styles.postHeader}>
              <Image source={{ uri: post.user.avatar }} style={styles.postUserAvatar} />
              <View style={styles.postUserInfo}>
                <View style={styles.userNameRow}>
                  <Text style={styles.postUserName}>{post.user.name}</Text>
                  {post.user.badges.map((badge, index) => (
                    <View key={index} style={styles.badge}>
                      <Text style={styles.badgeText}>{badge}</Text>
                    </View>
                  ))}
                </View>
                <View style={styles.postMeta}>
                  <Text style={styles.postTimestamp}>{post.timestamp}</Text>
                  {post.location && (
                    <>
                      <Text style={styles.metaSeparator}>•</Text>
                      <MapPin size={12} color="#6B7280" />
                      <Text style={styles.postLocation}>{post.location}</Text>
                    </>
                  )}
                </View>
                {post.event && (
                  <View style={styles.eventTag}>
                    <Calendar size={12} color="#3B82F6" />
                    <Text style={styles.eventText}>{post.event}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Post Content */}
            <Text style={styles.postContent}>{post.content}</Text>

            {/* Post Image */}
            {post.image && (
              <Image source={{ uri: post.image }} style={styles.postImage} />
            )}

            {/* Post Actions */}
            <View style={styles.postActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => toggleLike(post.id)}
              >
                <Heart
                  size={20}
                  color={likedPosts.includes(post.id) ? "#EF4444" : "#6B7280"}
                  fill={likedPosts.includes(post.id) ? "#EF4444" : "none"}
                />
                <Text style={[
                  styles.actionText,
                  likedPosts.includes(post.id) && styles.likedText
                ]}>
                  {post.likes + (likedPosts.includes(post.id) ? 1 : 0)}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton}>
                <MessageCircle size={20} color="#6B7280" />
                <Text style={styles.actionText}>{post.comments}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton}>
                <Share size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
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
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  cameraButton: {
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
  createPostSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    gap: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  createPostInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
  },
  createPostPlaceholder: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  feed: {
    flex: 1,
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  postHeader: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 12,
  },
  postUserAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  postUserInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  postUserName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  badge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#3B82F6',
  },
  postMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  postTimestamp: {
    fontSize: 12,
    color: '#6B7280',
  },
  metaSeparator: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  postLocation: {
    fontSize: 12,
    color: '#6B7280',
  },
  eventTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EBF8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  eventText: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '500',
  },
  postContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  likedText: {
    color: '#EF4444',
  },
});