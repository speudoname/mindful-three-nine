import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { mobileApi, DashboardSummary } from '../../lib/mobile-api';
import { Ionicons } from '@expo/vector-icons';

export default function Home() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, [user]);

  const loadDashboard = async () => {
    if (!user) return;

    setLoading(true);
    const data = await mobileApi.getDashboardSummary(user.id);
    setSummary(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome back!</Text>
        <Text style={styles.subtitle}>Continue your practice</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name="flame" size={32} color="#F59E0B" />
          <Text style={styles.statValue}>{summary?.current_streak || 0}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="fitness" size={32} color="#10B981" />
          <Text style={styles.statValue}>{summary?.total_sessions || 0}</Text>
          <Text style={styles.statLabel}>Sessions</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="time" size={32} color="#3B82F6" />
          <Text style={styles.statValue}>{summary?.total_minutes || 0}</Text>
          <Text style={styles.statLabel}>Minutes</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="star" size={32} color="#8B5CF6" />
          <Text style={styles.statValue}>{summary?.token_balance || 0}</Text>
          <Text style={styles.statLabel}>Tokens</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <TouchableOpacity style={styles.actionCard}>
          <View style={styles.actionIcon}>
            <Ionicons name="play-circle" size={32} color="#8B5CF6" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Start Meditation</Text>
            <Text style={styles.actionSubtitle}>Begin your practice now</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard}>
          <View style={styles.actionIcon}>
            <Ionicons name="fitness" size={32} color="#10B981" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Breathing Exercise</Text>
            <Text style={styles.actionSubtitle}>Calm your mind</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard}>
          <View style={styles.actionIcon}>
            <Ionicons name="book" size={32} color="#3B82F6" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Browse Courses</Text>
            <Text style={styles.actionSubtitle}>
              {summary?.enrolled_courses || 0} enrolled
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {(summary?.active_goals || 0) > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Goals</Text>
          <View style={styles.goalCard}>
            <Ionicons name="target" size={24} color="#8B5CF6" />
            <Text style={styles.goalText}>
              {summary?.active_goals} goal{summary?.active_goals !== 1 ? 's' : ''} in progress
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#fff',
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  actionIcon: {
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  goalText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#7C3AED',
  },
});
