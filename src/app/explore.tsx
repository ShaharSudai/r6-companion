import React from 'react';
import { StyleSheet, View, Text, ScrollView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import gameConfig from '@/constants/game-config.json';

export default function ExploreScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const theme = useTheme();

  // Insets calculations for padding
  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };

  const contentPlatformStyle = Platform.select({
    android: {
      paddingTop: insets.top,
      paddingLeft: insets.left,
      paddingRight: insets.right,
      paddingBottom: insets.bottom,
    },
    web: {
      paddingTop: Spacing.four,
      paddingBottom: Spacing.six,
    },
  });

  const maps = gameConfig.maps || [];
  const operators = gameConfig.operators || [];
  
  const attackers = operators.filter(o => o.role === 'attacker');
  const defenders = operators.filter(o => o.role === 'defender');

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentContainerStyle={[styles.contentContainer, contentPlatformStyle]}
      showsVerticalScrollIndicator={false}
    >
      <ThemedView style={styles.container}>
        
        {/* Hero title header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>
            TACTICAL CONFIGURATION
          </Text>
          <Text style={[styles.subtitle, { color: theme.primary }]}>
            Roster & Config Guide
          </Text>
        </View>

        {/* Tactical database stats */}
        <View style={styles.statsRow}>
          <ThemedView type="backgroundElement" style={[styles.statBox, { borderColor: theme.border }]}>
            <Text style={[styles.statNum, { color: theme.primary }]}>{maps.length}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>ACTIVE MAPS</Text>
          </ThemedView>
          <ThemedView type="backgroundElement" style={[styles.statBox, { borderColor: theme.border }]}>
            <Text style={[styles.statNum, { color: theme.attacker }]}>{attackers.length}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>ATTACKERS</Text>
          </ThemedView>
          <ThemedView type="backgroundElement" style={[styles.statBox, { borderColor: theme.border }]}>
            <Text style={[styles.statNum, { color: theme.defender }]}>{defenders.length}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>DEFENDERS</Text>
          </ThemedView>
        </View>

        {/* Configuration Guide panel */}
        <ThemedView type="backgroundElement" style={[styles.guidePanel, { borderColor: theme.primary }]}>
          <Text style={[styles.panelTitle, { color: theme.text }]}>
            ⚙️ EDITING MAPS AND OPERATORS
          </Text>
          <Text style={[styles.panelBody, { color: theme.textSecondary }]}>
            You can customize the available maps and operators at any time by editing the JSON configuration file located at:
          </Text>
          <View style={[styles.codeBlock, { backgroundColor: theme.background }]}>
            <Text style={[styles.codeText, { color: theme.primary }]}>
              src/constants/game-config.json
            </Text>
          </View>
          <Text style={[styles.panelBody, { color: theme.textSecondary, marginTop: Spacing.two }]}>
            Simply open that file, add or delete entries inside the <Text style={{fontWeight: '700'}}>{"\"maps\""}</Text> or <Text style={{fontWeight: '700'}}>{"\"operators\""}</Text> arrays, and save. The companion app will immediately reload with your changes.
          </Text>
        </ThemedView>

        {/* Live configuration view list */}
        <View style={styles.listsSection}>
          <View style={styles.listContainer}>
            <Text style={[styles.listSectionTitle, { color: theme.text }]}>
              🗺️ LOADED MAPS ({maps.length})
            </Text>
            <ThemedView type="backgroundElement" style={[styles.listWrapper, { borderColor: theme.border }]}>
              {maps.map((m) => (
                <View key={m.id} style={[styles.listItem, { borderBottomWidth: 1, borderColor: theme.border }]}>
                  <Text style={[styles.listItemText, { color: theme.text }]}>{m.name}</Text>
                  <Text style={[styles.listItemTag, { color: theme.textSecondary }]}>MAP</Text>
                </View>
              ))}
            </ThemedView>
          </View>

          <View style={styles.listContainer}>
            <Text style={[styles.listSectionTitle, { color: theme.text }]}>
              🥷 LOADED OPERATORS ({operators.length})
            </Text>
            
            <ThemedView type="backgroundElement" style={[styles.listWrapper, { borderColor: theme.border }]}>
              <View style={styles.roleSubHeader}>
                <Text style={[styles.roleSubHeaderText, { color: theme.attacker }]}>ATTACKERS</Text>
              </View>
              {attackers.map((op) => (
                <View key={op.id} style={[styles.listItem, { borderBottomWidth: 1, borderColor: theme.border }]}>
                  <Text style={[styles.listItemText, { color: theme.text }]}>{op.name}</Text>
                  <Text style={[styles.listItemTag, { color: theme.attacker }]}>ATTACKER</Text>
                </View>
              ))}

              <View style={[styles.roleSubHeader, { marginTop: Spacing.two }]}>
                <Text style={[styles.roleSubHeaderText, { color: theme.defender }]}>DEFENDERS</Text>
              </View>
              {defenders.map((op) => (
                <View key={op.id} style={[styles.listItem, { borderBottomWidth: 1, borderColor: theme.border }]}>
                  <Text style={[styles.listItemText, { color: theme.text }]}>{op.name}</Text>
                  <Text style={[styles.listItemTag, { color: theme.defender }]}>DEFENDER</Text>
                </View>
              ))}
            </ThemedView>
          </View>
        </View>

      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: Spacing.three,
  },
  container: {
    maxWidth: MaxContentWidth,
    width: '100%',
    gap: Spacing.four,
  },
  header: {
    marginTop: Spacing.two,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  statNum: {
    fontSize: 24,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: Spacing.one,
  },
  guidePanel: {
    borderWidth: 1,
    borderRadius: 8,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  panelTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  panelBody: {
    fontSize: 12,
    lineHeight: 18,
  },
  codeBlock: {
    borderRadius: 4,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    marginTop: Spacing.one,
    alignSelf: 'flex-start',
  },
  codeText: {
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace', web: 'monospace' }),
    fontSize: 12,
    fontWeight: '700',
  },
  listsSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.four,
    marginBottom: Spacing.six,
  },
  listContainer: {
    flex: 1,
    minWidth: 280,
    gap: Spacing.two,
  },
  listSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  listWrapper: {
    borderWidth: 1,
    borderRadius: 8,
    padding: Spacing.two,
  },
  roleSubHeader: {
    paddingVertical: 4,
    paddingHorizontal: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  roleSubHeaderText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: Spacing.two,
  },
  listItemText: {
    fontSize: 13,
    fontWeight: '600',
  },
  listItemTag: {
    fontSize: 9,
    fontWeight: '800',
  },
});
