import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Modal,
  useWindowDimensions,
  Platform,
  Alert,
  FlatList,
  BackHandler,
  ToastAndroid,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

import { ThemedView } from '@/components/themed-view';
import { Spacing, BottomTabInset } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useLinksDb, VideoLink } from '@/hooks/use-links-db';
import { useSafeShareIntent } from '@/hooks/use-share-intent';
import gameConfig from '@/constants/game-config.json';
import { MapImages, OperatorImages } from '@/constants/game-assets';

// Helper to determine platform domain for badge styling
function getPlatformBadge(url: string) {
  const lowercaseUrl = url.toLowerCase();
  if (lowercaseUrl.includes('youtube.com') || lowercaseUrl.includes('youtu.be')) {
    return { name: 'YouTube', color: '#FF0000', icon: 'play' };
  }
  if (lowercaseUrl.includes('tiktok.com')) {
    return { name: 'TikTok', color: '#00F2FE', icon: 'link' };
  }
  if (lowercaseUrl.includes('twitch.tv')) {
    return { name: 'Twitch', color: '#9146FF', icon: 'play' };
  }
  if (lowercaseUrl.includes('instagram.com')) {
    return { name: 'Instagram', color: '#E1306C', icon: 'link' };
  }
  return { name: 'Video', color: '#F4B41A', icon: 'link' };
}

// Icon helper component rendering pure CSS/View custom cross-platform shapes
function TacticalIcon({
  name,
  color,
  size = 16,
}: {
  name: 'plus' | 'trash' | 'link' | 'back' | 'search' | 'close' | 'play' | 'map' | 'person' | 'lock';
  color: string;
  size?: number;
}) {
  switch (name) {
    case 'plus':
      return (
        <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ width: size * 0.75, height: 2, backgroundColor: color, position: 'absolute' }} />
          <View style={{ width: 2, height: size * 0.75, backgroundColor: color, position: 'absolute' }} />
        </View>
      );
    case 'close':
      return (
        <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ width: size * 0.7, height: 2, backgroundColor: color, position: 'absolute', transform: [{ rotate: '45deg' }] }} />
          <View style={{ width: size * 0.7, height: 2, backgroundColor: color, position: 'absolute', transform: [{ rotate: '-45deg' }] }} />
        </View>
      );
    case 'trash':
      return (
        <View style={{ width: size, height: size + 2, justifyContent: 'center', alignItems: 'center', gap: 1 }}>
          <View style={{ width: size * 0.35, height: 1.5, backgroundColor: color }} />
          <View style={{ width: size * 0.75, height: 1.5, backgroundColor: color, borderRadius: 1 }} />
          <View style={{
            width: size * 0.55,
            height: size * 0.65,
            borderWidth: 1.5,
            borderColor: color,
            borderTopWidth: 0,
            borderBottomLeftRadius: 2,
            borderBottomRightRadius: 2,
            justifyContent: 'space-around',
            flexDirection: 'row',
            paddingHorizontal: 2,
            paddingVertical: 1
          }}>
            <View style={{ width: 1, height: '90%', backgroundColor: color, opacity: 0.8 }} />
            <View style={{ width: 1, height: '90%', backgroundColor: color, opacity: 0.8 }} />
          </View>
        </View>
      );
    case 'back':
      return (
        <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{
            width: size * 0.45,
            height: size * 0.45,
            borderLeftWidth: 2,
            borderBottomWidth: 2,
            borderColor: color,
            transform: [{ rotate: '45deg' }],
            marginLeft: size * 0.15
          }} />
        </View>
      );
    case 'play':
      return (
        <View style={{
          width: 0,
          height: 0,
          backgroundColor: 'transparent',
          borderStyle: 'solid',
          borderLeftWidth: size * 0.7,
          borderRightWidth: 0,
          borderBottomWidth: size * 0.4,
          borderTopWidth: size * 0.4,
          borderLeftColor: color,
          borderRightColor: 'transparent',
          borderBottomColor: 'transparent',
          borderTopColor: 'transparent',
          marginLeft: size * 0.15
        }} />
      );
    case 'search':
      return (
        <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{
            width: size * 0.55,
            height: size * 0.55,
            borderRadius: 99,
            borderWidth: 1.8,
            borderColor: color,
            position: 'absolute',
            top: 1,
            left: 1,
          }} />
          <View style={{
            width: 1.8,
            height: size * 0.45,
            backgroundColor: color,
            position: 'absolute',
            bottom: 0,
            right: 0,
            transform: [{ rotate: '-45deg' }]
          }} />
        </View>
      );
    case 'link':
      return (
        <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
          <View style={{
            width: size * 0.65,
            height: size * 0.65,
            borderWidth: 1.2,
            borderColor: color,
            position: 'absolute',
            bottom: 0,
            left: 0,
            borderTopWidth: 0,
            borderRightWidth: 0,
          }} />
          <View style={{
            width: size * 0.3,
            height: 1.2,
            backgroundColor: color,
            position: 'absolute',
            bottom: size * 0.65,
            left: 0
          }} />
          <View style={{
            width: 1.2,
            height: size * 0.3,
            backgroundColor: color,
            position: 'absolute',
            bottom: 0,
            left: size * 0.65
          }} />
          <View style={{
            width: 1.2,
            height: size * 0.65,
            backgroundColor: color,
            position: 'absolute',
            transform: [{ rotate: '-45deg' }],
            top: size * 0.08,
            right: size * 0.08
          }} />
          <View style={{
            width: size * 0.3,
            height: size * 0.3,
            borderTopWidth: 1.2,
            borderRightWidth: 1.2,
            borderColor: color,
            position: 'absolute',
            top: 0,
            right: 0
          }} />
        </View>
      );
    case 'map':
      return (
        <View style={{ width: size, height: size, borderWidth: 1.2, borderColor: color, borderRadius: 2, padding: 2, justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', height: '40%' }}>
            <View style={{ width: '40%', height: '100%', backgroundColor: color }} />
            <View style={{ width: '40%', height: '100%', borderWidth: 1.2, borderColor: color }} />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', height: '40%' }}>
            <View style={{ width: '40%', height: '100%', borderWidth: 1.2, borderColor: color }} />
            <View style={{ width: '40%', height: '100%', backgroundColor: color }} />
          </View>
        </View>
      );
    case 'person':
      return (
        <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: size * 0.45, height: size * 0.45, borderRadius: size * 0.22, borderWidth: 1.2, borderColor: color, marginBottom: 1 }} />
          <View style={{ width: size * 0.8, height: size * 0.3, borderTopLeftRadius: size * 0.25, borderTopRightRadius: size * 0.25, borderWidth: 1.2, borderBottomWidth: 0, borderColor: color }} />
        </View>
      );
    case 'lock':
      return (
        <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: size * 0.5, height: size * 0.4, borderTopLeftRadius: size * 0.25, borderTopRightRadius: size * 0.25, borderWidth: 1.2, borderBottomWidth: 0, borderColor: color, position: 'absolute', top: 1 }} />
          <View style={{ width: size * 0.7, height: size * 0.5, borderWidth: 1.2, borderColor: color, borderRadius: 2, backgroundColor: 'transparent', position: 'absolute', bottom: 1 }} />
        </View>
      );
    default:
      return null;
  }
}

const MapCard = React.memo(({
  item,
  isSelected,
  onPress,
  theme
}: {
  item: typeof maps[0];
  isSelected: boolean;
  onPress: (id: string) => void;
  theme: any;
}) => {
  const mapImage = MapImages[item.id];
  return (
    <Pressable
      style={({ pressed }) => [
        styles.mapCard,
        {
          backgroundColor: theme.backgroundElement,
          borderColor: isSelected ? theme.primary : theme.border,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
      onPress={() => onPress(item.id)}
    >
      {mapImage && (
        <View style={StyleSheet.absoluteFillObject}>
          <Image
            source={mapImage}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            transition={null}
            cachePolicy="memory-disk"
          />
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0, 0, 0, 0.65)' }]} />
        </View>
      )}
      <View style={styles.mapCardContent}>
        <View style={styles.mapHeaderRow}>
          <Text style={[styles.mapName, { color: '#fff' }]}>{item.name}</Text>
        </View>
      </View>
      {isSelected && (
        <View style={[styles.activeIndicator, { backgroundColor: theme.primary }]} />
      )}
    </Pressable>
  );
});
MapCard.displayName = 'MapCard';

const OperatorTile = React.memo(({
  item,
  isSelected,
  onPress,
  theme,
  clipCount = 0
}: {
  item: typeof operators[0];
  isSelected: boolean;
  onPress: (id: string) => void;
  theme: any;
  clipCount?: number;
}) => {
  const isAttacker = item.role === 'attacker';
  const roleColor = isAttacker ? theme.attacker : theme.defender;
  const opImage = OperatorImages[item.id];

  return (
    <Pressable
      style={({ pressed }) => [
        styles.opTile,
        {
          backgroundColor: theme.backgroundElement,
          borderColor: isSelected ? theme.primary : theme.border,
          transform: [{ scale: pressed ? 0.96 : 1 }],
        },
      ]}
      onPress={() => onPress(item.id)}
    >
      <View style={[styles.opRoleBar, { backgroundColor: roleColor }]} />
      {clipCount > 0 && (
        <View style={[styles.opClipBadge, { backgroundColor: theme.primary }]}>
          <Text style={[styles.opClipBadgeText, { color: '#000' }]}>{clipCount}</Text>
        </View>
      )}
      {opImage && (
        <Image
          source={opImage}
          style={styles.opAvatar}
          contentFit="contain"
          transition={null}
          cachePolicy="memory-disk"
        />
      )}
      <Text style={[styles.opName, { color: theme.text }]}>{item.name}</Text>
      <Text style={[styles.opRoleText, { color: roleColor }]}>
        {item.role.toUpperCase()}
      </Text>
      {isSelected && (
        <View style={[styles.opCheckIcon, { backgroundColor: theme.primary }]}>
          <TacticalIcon name="play" color="#000" size={10} />
        </View>
      )}
    </Pressable>
  );
});
OperatorTile.displayName = 'OperatorTile';

export default function CompanionScreen() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  // Double back press exit tracking
  const lastBackPressTime = useRef<number>(0);

  // Safe Share Intent Hook
  const { hasShareIntent, shareIntent, resetShareIntent } = useSafeShareIntent();

  // Mock Share Intent for testing in Expo Go
  const [mockShareIntent, setMockShareIntent] = useState<{ type: string, value: string } | null>(null);
  
  // Share Intent State
  const [shareMapId, setShareMapId] = useState<string | null>(null);
  const [shareOperatorId, setShareOperatorId] = useState<string | null>(null);
  const [shareHeadline, setShareHeadline] = useState('');
  const [shareMapSearch, setShareMapSearch] = useState('');
  const [shareOpSearch, setShareOpSearch] = useState('');

  const shareValue = shareIntent?.webUrl || shareIntent?.text || mockShareIntent?.value || '';
  const hasActiveShareIntent = hasShareIntent || !!mockShareIntent;

  const handleResetShareIntent = useCallback(() => {
    resetShareIntent();
    setMockShareIntent(null);
    setShareMapId(null);
    setShareOperatorId(null);
    setShareHeadline('');
    setShareMapSearch('');
    setShareOpSearch('');
  }, [
    resetShareIntent,
    setMockShareIntent,
    setShareMapId,
    setShareOperatorId,
    setShareHeadline,
    setShareMapSearch,
    setShareOpSearch
  ]);

  // Load config maps and operators with safe fallbacks
  const maps = gameConfig.maps || [];
  const operators = gameConfig.operators || [];

  // Database hook
  const { getLinks, addLink, deleteLink } = useLinksDb();

  // App state
  const [selectedMapId, setSelectedMapId] = useState<string | null>(null);
  const [selectedOperatorId, setSelectedOperatorId] = useState<string | null>(null);
  
  // Mobile step state: 0 = map selection, 1 = operator selection, 2 = videos
  const [mobileStep, setMobileStep] = useState(0);

  // Search & Filter state
  const [mapSearch, setMapSearch] = useState('');
  const [opSearch, setOpSearch] = useState('');
  const [opRoleFilter, setOpRoleFilter] = useState<'all' | 'attacker' | 'defender'>('all');

  // Add Link Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [linkHeadline, setLinkHeadline] = useState('');
  const [linkUrl, setLinkUrl] = useState('');

  // Selected entities details
  const selectedMap = maps.find((m) => m.id === selectedMapId);
  const selectedOperator = operators.find((o) => o.id === selectedOperatorId);
  const mapImage = selectedMapId ? MapImages[selectedMapId] : null;
  const opImage = selectedOperatorId ? OperatorImages[selectedOperatorId] : null;

  // Filtering maps
  const filteredMaps = maps.filter((m) =>
    m.name.toLowerCase().includes(mapSearch.toLowerCase())
  );

  // Filtering & sorting operators (placing operators with clips on the selected map at the top)
  const filteredOperators = operators
    .filter((o) => {
      const matchesSearch = o.name.toLowerCase().includes(opSearch.toLowerCase());
      const matchesRole = opRoleFilter === 'all' || o.role === opRoleFilter;
      return matchesSearch && matchesRole;
    })
    .sort((a, b) => {
      if (!selectedMapId) return 0;
      const aCount = getLinks(selectedMapId, a.id).length;
      const bCount = getLinks(selectedMapId, b.id).length;
      if (aCount !== bCount) {
        return bCount - aCount;
      }
      return 0;
    });

  // Filtering maps in Share Intent Modal
  const filteredShareMaps = maps.filter((m) =>
    m.name.toLowerCase().includes(shareMapSearch.toLowerCase())
  );

  // Filtering operators in Share Intent Modal
  const filteredShareOperators = operators.filter((o) =>
    o.name.toLowerCase().includes(shareOpSearch.toLowerCase())
  );

  // Load videos for current selection
  const currentVideos = selectedMapId && selectedOperatorId 
    ? getLinks(selectedMapId, selectedOperatorId) 
    : [];

  const handleOpenLink = async (url: string) => {
    let formattedUrl = url.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }
    try {
      const canOpen = await Linking.canOpenURL(formattedUrl);
      if (canOpen) {
        await Linking.openURL(formattedUrl);
      } else {
        await WebBrowser.openBrowserAsync(formattedUrl);
      }
    } catch {
      if (Platform.OS === 'web') {
        window.open(formattedUrl, '_blank');
      } else {
        Alert.alert('Error', 'Could not open video URL.');
      }
    }
  };

  const handleAddLink = async () => {
    if (!selectedMapId || !selectedOperatorId) return;
    if (!linkHeadline.trim()) {
      if (Platform.OS === 'web') alert('Please enter a headline');
      else Alert.alert('Validation Error', 'Please enter a headline');
      return;
    }
    if (!linkUrl.trim()) {
      if (Platform.OS === 'web') alert('Please enter a URL');
      else Alert.alert('Validation Error', 'Please enter a URL');
      return;
    }

    await addLink(selectedMapId, selectedOperatorId, linkHeadline, linkUrl);
    setLinkHeadline('');
    setLinkUrl('');
    setIsModalOpen(false);
  };

  const handleDeleteLink = (linkId: string) => {
    if (!selectedMapId || !selectedOperatorId) return;

    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to delete this clip?')) {
        deleteLink(selectedMapId, selectedOperatorId, linkId);
      }
    } else {
      Alert.alert(
        'Delete Clip',
        'Are you sure you want to delete this clip?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => deleteLink(selectedMapId!, selectedOperatorId!, linkId) },
        ]
      );
    }
  };

  const handleSelectMap = useCallback((mapId: string) => {
    setSelectedMapId(mapId);
    setSelectedOperatorId(null);
    if (!isDesktop) {
      setMobileStep(1);
    }
  }, [isDesktop, setSelectedMapId, setSelectedOperatorId, setMobileStep]);

  const handleSelectOperator = useCallback((opId: string) => {
    setSelectedOperatorId(opId);
    if (!isDesktop) {
      setMobileStep(2);
    }
  }, [isDesktop, setSelectedOperatorId, setMobileStep]);

  const resetSelection = useCallback(() => {
    setSelectedMapId(null);
    setSelectedOperatorId(null);
    setMobileStep(0);
    setMapSearch('');
    setOpSearch('');
  }, [setSelectedMapId, setSelectedOperatorId, setMobileStep, setMapSearch, setOpSearch]);

  // Android hardware back button handler
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const onBackPress = () => {
      // 1. If modals are open, close them first
      if (isModalOpen) {
        setIsModalOpen(false);
        return true;
      }
      if (hasActiveShareIntent && !!shareValue) {
        handleResetShareIntent();
        return true;
      }

      // 2. Navigation handling
      if (isDesktop) {
        if (selectedMapId || selectedOperatorId) {
          resetSelection();
          return true;
        }
      } else {
        if (mobileStep === 2) {
          setSelectedOperatorId(null);
          setMobileStep(1);
          return true;
        } else if (mobileStep === 1) {
          setSelectedMapId(null);
          setMobileStep(0);
          return true;
        }
      }

      // 3. Double press to exit if at root (mobileStep === 0 or no selections)
      const now = Date.now();
      if (now - lastBackPressTime.current < 2000) {
        BackHandler.exitApp();
        return true;
      }

      lastBackPressTime.current = now;
      ToastAndroid.show('Press back again to exit', ToastAndroid.SHORT);
      return true;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [
    isModalOpen,
    hasActiveShareIntent,
    shareValue,
    handleResetShareIntent,
    isDesktop,
    selectedMapId,
    selectedOperatorId,
    mobileStep,
    resetSelection,
    setSelectedOperatorId,
    setSelectedMapId,
    setMobileStep,
  ]);

  // ---------------- RENDERS ----------------

  // Render Map Card Item
  const renderMapItem = useCallback(({ item }: { item: typeof maps[0] }) => {
    return (
      <MapCard
        item={item}
        isSelected={selectedMapId === item.id}
        onPress={handleSelectMap}
        theme={theme}
      />
    );
  }, [selectedMapId, handleSelectMap, theme]);

  // Render Operator Tile Item
  const renderOperatorItem = useCallback(({ item }: { item: typeof operators[0] }) => {
    const clipCount = selectedMapId ? getLinks(selectedMapId, item.id).length : 0;
    return (
      <OperatorTile
        item={item}
        isSelected={selectedOperatorId === item.id}
        onPress={handleSelectOperator}
        theme={theme}
        clipCount={clipCount}
      />
    );
  }, [selectedMapId, selectedOperatorId, handleSelectOperator, theme, getLinks]);

  // Render Video Link Card Item
  const renderVideoItem = (video: VideoLink) => {
    const badge = getPlatformBadge(video.url);
    return (
      <View
        key={video.id}
        style={[
          styles.videoCard,
          {
            backgroundColor: theme.backgroundElement,
            borderColor: theme.border,
          },
        ]}
      >
        <View style={styles.videoInfo}>
          <View style={styles.badgeRow}>
            <View style={[styles.platformBadge, { backgroundColor: badge.color }]}>
              <Text style={styles.platformBadgeText}>{badge.name}</Text>
            </View>
            <Text style={[styles.addedAtText, { color: theme.textSecondary }]}>
              {new Date(video.addedAt).toLocaleDateString()}
            </Text>
          </View>
          <Text style={[styles.videoHeadline, { color: theme.text }]} numberOfLines={2}>
            {video.headline}
          </Text>
          <Text style={[styles.videoUrlText, { color: theme.textSecondary }]} numberOfLines={1}>
            {video.url}
          </Text>
        </View>

        <View style={styles.videoActions}>
          <Pressable
            style={({ pressed }) => [
              styles.watchButton,
              {
                backgroundColor: theme.primary,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
            onPress={() => handleOpenLink(video.url)}
          >
            <TacticalIcon name="play" color="#000" size={12} />
            <Text style={styles.watchButtonText}>WATCH</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.deleteButton,
              {
                backgroundColor: 'rgba(255, 77, 77, 0.1)',
                borderColor: theme.danger,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
            onPress={() => handleDeleteLink(video.id)}
          >
            <TacticalIcon name="trash" color={theme.danger} size={14} />
          </Pressable>
        </View>
      </View>
    );
  };

  // ---------------- WIDESCREEN / DESKTOP VIEW ----------------
  const renderDesktopLayout = () => {
    return (
      <View style={styles.desktopContainer}>
        {/* Col 1: Maps List */}
        <View style={[styles.desktopColumn, { flex: 1.1, borderRightWidth: 1, borderColor: theme.border }]}>
          <View style={styles.columnHeader}>
            <Text style={[styles.columnTitle, { color: theme.text }]}>TACTICAL MAPS</Text>
            <Text style={[styles.columnSubtitle, { color: theme.textSecondary }]}>
              Select Map
            </Text>
          </View>
          
          <View style={styles.searchWrapper}>
            <TacticalIcon name="search" color={theme.textSecondary} size={16} />
            <TextInput
              style={[styles.searchInput, { color: theme.text, backgroundColor: theme.background }]}
              placeholder="Search maps..."
              placeholderTextColor={theme.textSecondary}
              value={mapSearch}
              onChangeText={setMapSearch}
            />
            {mapSearch.length > 0 && (
              <Pressable onPress={() => setMapSearch('')}>
                <TacticalIcon name="close" color={theme.textSecondary} size={14} />
              </Pressable>
            )}
          </View>

          <FlatList
            data={filteredMaps}
            renderItem={renderMapItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.scrollList}
            showsVerticalScrollIndicator={false}
            initialNumToRender={8}
            maxToRenderPerBatch={4}
            windowSize={9}
            removeClippedSubviews={Platform.OS === 'android'}
            getItemLayout={(data, index) => ({ length: 88, offset: 88 * index, index })}
            ListEmptyComponent={
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No maps found</Text>
            }
          />
        </View>

        {/* Col 2: Operator Grid */}
        <View style={[styles.desktopColumn, { flex: 1.5, borderRightWidth: 1, borderColor: theme.border }]}>
          <View style={styles.columnHeader}>
            <Text style={[styles.columnTitle, { color: theme.text }]}>OPERATOR</Text>
            <Text style={[styles.columnSubtitle, { color: theme.textSecondary }]}>
              {selectedMap ? `Targeting: ${selectedMap.name}` : 'Select a map first'}
            </Text>
          </View>

          {!selectedMapId ? (
            <View style={styles.columnPlaceholder}>
              <TacticalIcon name="lock" color={theme.textSecondary} size={36} />
              <Text style={[styles.placeholderTitle, { color: theme.text }]}>Map Unselected</Text>
              <Text style={[styles.placeholderBody, { color: theme.textSecondary }]}>
                Select a tactical map from the left panel to unlock the operator roster.
              </Text>
            </View>
          ) : (
            <>
              {/* Operator filters */}
              <View style={styles.filterBar}>
                <View style={styles.roleFilterContainer}>
                  {(['all', 'attacker', 'defender'] as const).map((role) => (
                    <Pressable
                      key={role}
                      style={[
                        styles.filterTab,
                        opRoleFilter === role && {
                          backgroundColor: theme.primary,
                        },
                      ]}
                      onPress={() => setOpRoleFilter(role)}
                    >
                      <Text
                        style={[
                          styles.filterTabText,
                          { color: opRoleFilter === role ? '#000' : theme.text },
                        ]}
                      >
                        {role.toUpperCase()}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <View style={[styles.searchWrapper, { flex: 1, marginLeft: Spacing.two }]}>
                  <TextInput
                    style={[styles.searchInput, { color: theme.text, backgroundColor: theme.background }]}
                    placeholder="Search op..."
                    placeholderTextColor={theme.textSecondary}
                    value={opSearch}
                    onChangeText={setOpSearch}
                  />
                </View>
              </View>

              <FlatList
                data={filteredOperators}
                renderItem={renderOperatorItem}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: Spacing.two }}
                contentContainerStyle={styles.opGrid}
                showsVerticalScrollIndicator={false}
                initialNumToRender={12}
                maxToRenderPerBatch={6}
                windowSize={3}
                removeClippedSubviews={Platform.OS === 'android'}
                ListEmptyComponent={
                  <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No operators found</Text>
                }
              />
            </>
          )}
        </View>

        {/* Col 3: Video Links */}
        <View style={[styles.desktopColumn, { flex: 1.8 }]}>
          <View style={styles.columnHeader}>
            <Text style={[styles.columnTitle, { color: theme.text }]}>TACTICAL INTEL</Text>
            <Text style={[styles.columnSubtitle, { color: theme.textSecondary }]}>
              {selectedOperator ? `Tactics for ${selectedOperator.name}` : 'Select an operator'}
            </Text>
          </View>

          {!selectedMapId || !selectedOperatorId ? (
            <View style={styles.columnPlaceholder}>
              <TacticalIcon name="person" color={theme.textSecondary} size={36} />
              <Text style={[styles.placeholderTitle, { color: theme.text }]}>Operator Details</Text>
              <Text style={[styles.placeholderBody, { color: theme.textSecondary }]}>
                Choose a map and an operator to load the strategy database and video guides.
              </Text>
            </View>
          ) : (
            <View style={styles.videosContainer}>
              <View style={[styles.dossierBanner, { borderColor: theme.border }]}>
                {mapImage && (
                  <View style={StyleSheet.absoluteFillObject}>
                    <Image source={mapImage} style={{ width: '100%', height: '100%' }} contentFit="cover" transition={null} cachePolicy="memory-disk" />
                    <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(11, 12, 16, 0.8)' }]} />
                  </View>
                )}
                <View style={styles.dossierContent}>
                  {opImage && (
                    <Image source={opImage} style={styles.dossierOpAvatar} contentFit="contain" transition={null} cachePolicy="memory-disk" />
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.dossierTitle}>
                      {selectedOperator.name} on {selectedMap.name}
                    </Text>
                    <Text style={[styles.dossierSubtitle, { color: theme.primary }]}>
                      ACTIVE TACTICAL DATA • {currentVideos.length} CLIP(S)
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.videosHeader}>
                <Text style={[styles.intelSubHeading, { color: theme.textSecondary }]}>
                  Strategic Intelligence Links
                </Text>
                <Pressable
                  style={({ pressed }) => [
                    styles.addFloatingBtn,
                    { backgroundColor: theme.primary, opacity: pressed ? 0.9 : 1 },
                  ]}
                  onPress={() => setIsModalOpen(true)}
                >
                  <TacticalIcon name="plus" color="#000" size={12} />
                  <Text style={styles.addBtnLabel}>ADD CLIP</Text>
                </Pressable>
              </View>

              <ScrollView contentContainerStyle={styles.videosScroll} showsVerticalScrollIndicator={false}>
                {currentVideos.map(renderVideoItem)}
                {currentVideos.length === 0 && (
                  <View style={[styles.blueprintCard, { borderColor: theme.border }]}>
                    <Text style={[styles.blueprintTitle, { color: theme.primary }]}>
                      NO STRAT DATA FOUND
                    </Text>
                    <Text style={[styles.blueprintBody, { color: theme.textSecondary }]}>
                      Establish communications. Click {"\"ADD CLIP\""} to upload content for {selectedOperator.name} on {selectedMap.name}.
                    </Text>
                  </View>
                )}
              </ScrollView>
            </View>
          )}
        </View>
      </View>
    );
  };

  // ---------------- MOBILE / PHONE VIEW ----------------
  const renderMobileLayout = () => {
    return (
      <View style={styles.mobileContainer}>
        {/* Step 1: Maps Selection */}
        {mobileStep === 0 && (
          <View style={styles.mobilePanel}>
            <View style={styles.mobileHeader}>
              <Text style={[styles.mobileTitle, { color: theme.text }]}>MAPS</Text>
              <Text style={[styles.mobileSubtitle, { color: theme.textSecondary }]}>Select map from the list below</Text>
            </View>

            <View style={[styles.searchWrapper, { marginHorizontal: Spacing.three, marginBottom: Spacing.two }]}>
              <TacticalIcon name="search" color={theme.textSecondary} size={16} />
              <TextInput
                style={[styles.searchInput, { color: theme.text, backgroundColor: theme.background }]}
                placeholder="Search maps..."
                placeholderTextColor={theme.textSecondary}
                value={mapSearch}
                onChangeText={setMapSearch}
              />
              {mapSearch.length > 0 && (
                <Pressable onPress={() => setMapSearch('')}>
                  <TacticalIcon name="close" color={theme.textSecondary} size={14} />
                </Pressable>
              )}
            </View>

            <FlatList
              data={filteredMaps}
              renderItem={renderMapItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.mobileScrollContent}
              showsVerticalScrollIndicator={false}
              initialNumToRender={8}
              maxToRenderPerBatch={4}
              windowSize={9}
              removeClippedSubviews={Platform.OS === 'android'}
              getItemLayout={(data, index) => ({ length: 88, offset: 88 * index, index })}
              ListEmptyComponent={
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No maps found</Text>
              }
            />
          </View>
        )}

        {/* Step 2: Operator Selection */}
        {mobileStep === 1 && selectedMap && (
          <View style={styles.mobilePanel}>
            {/* Breadcrumb / Top control */}
            <View style={[styles.breadcrumbRow, { borderBottomWidth: 1, borderColor: theme.border }]}>
              <Pressable style={styles.backBtn} onPress={() => setMobileStep(0)}>
                <TacticalIcon name="back" color={theme.primary} size={16} />
                <Text style={[styles.backBtnText, { color: theme.primary }]}>MAPS</Text>
              </Pressable>
              <Text style={[styles.breadcrumbText, { color: theme.textSecondary }]}>
                {selectedMap.name}
              </Text>
            </View>

            <View style={styles.mobileHeader}>
              <Text style={[styles.mobileTitle, { color: theme.text }]}>OPERATORS</Text>
              <Text style={[styles.mobileSubtitle, { color: theme.textSecondary }]}>Choose operator from the list below</Text>
            </View>

            {/* Operator Filters */}
            <View style={styles.mobileFilterBar}>
              {/* Search Bar */}
              <View style={[styles.searchWrapper, { marginHorizontal: 0, marginBottom: Spacing.two }]}>
                <TacticalIcon name="search" color={theme.textSecondary} size={16} />
                <TextInput
                  style={[styles.searchInput, { color: theme.text, backgroundColor: theme.background }]}
                  placeholder="Search operator..."
                  placeholderTextColor={theme.textSecondary}
                  value={opSearch}
                  onChangeText={setOpSearch}
                />
                {opSearch.length > 0 && (
                  <Pressable onPress={() => setOpSearch('')}>
                    <TacticalIcon name="close" color={theme.textSecondary} size={14} />
                  </Pressable>
                )}
              </View>

              {/* Role filter toggles */}
              <View style={[styles.roleFilterContainer, { alignSelf: 'stretch' }]}>
                {(['all', 'attacker', 'defender'] as const).map((role) => (
                  <Pressable
                    key={role}
                    style={[
                      styles.filterTab,
                      { flex: 1 },
                      opRoleFilter === role && {
                        backgroundColor: theme.primary,
                      },
                    ]}
                    onPress={() => setOpRoleFilter(role)}
                  >
                    <Text
                      style={[
                        styles.filterTabText,
                        { color: opRoleFilter === role ? '#000' : theme.text, fontSize: 11, textAlign: 'center' },
                      ]}
                    >
                      {role.toUpperCase()}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <FlatList
              data={filteredOperators}
              renderItem={renderOperatorItem}
              keyExtractor={(item) => item.id}
              numColumns={2}
              columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: Spacing.two }}
              contentContainerStyle={styles.mobileOpGridContent}
              showsVerticalScrollIndicator={false}
              initialNumToRender={12}
              maxToRenderPerBatch={6}
              windowSize={3}
              removeClippedSubviews={Platform.OS === 'android'}
              ListEmptyComponent={
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No operators found</Text>
              }
            />
          </View>
        )}

        {/* Step 3: Video Clips */}
        {mobileStep === 2 && selectedMap && selectedOperator && (
          <View style={styles.mobilePanel}>
            {/* Breadcrumb / Top control */}
            <View style={[styles.breadcrumbRow, { borderBottomWidth: 1, borderColor: theme.border }]}>
              <Pressable style={styles.backBtn} onPress={() => setMobileStep(1)}>
                <TacticalIcon name="back" color={theme.primary} size={16} />
                <Text style={[styles.backBtnText, { color: theme.primary }]}>OPERATORS</Text>
              </Pressable>
              <Text style={[styles.breadcrumbText, { color: theme.textSecondary }]}>
                {selectedMap.name} &gt; {selectedOperator.name}
              </Text>
            </View>

            <View style={styles.videosContainer}>
              <View style={[styles.dossierBanner, { borderColor: theme.border, marginHorizontal: Spacing.three }]}>
                {mapImage && (
                  <View style={StyleSheet.absoluteFillObject}>
                    <Image source={mapImage} style={{ width: '100%', height: '100%' }} contentFit="cover" transition={null} cachePolicy="memory-disk" />
                    <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(11, 12, 16, 0.8)' }]} />
                  </View>
                )}
                <View style={styles.dossierContent}>
                  {opImage && (
                    <Image source={opImage} style={styles.dossierOpAvatar} contentFit="contain" transition={null} cachePolicy="memory-disk" />
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.dossierTitle}>
                      {selectedOperator.name}
                    </Text>
                    <Text style={[styles.dossierSubtitle, { color: theme.primary }]}>
                      ACTIVE DOSSIER • {currentVideos.length} CLIP(S)
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.videosHeader}>
                <Text style={[styles.intelSubHeading, { color: theme.textSecondary }]}>
                  Strategic Intelligence Links
                </Text>
                <Pressable
                  style={({ pressed }) => [
                    styles.addFloatingBtnMobile,
                    { backgroundColor: theme.primary, opacity: pressed ? 0.9 : 1 },
                  ]}
                  onPress={() => setIsModalOpen(true)}
                >
                  <TacticalIcon name="plus" color="#000" size={16} />
                </Pressable>
              </View>

              <ScrollView
                contentContainerStyle={[styles.mobileVideosScroll, { paddingBottom: BottomTabInset + 40 }]}
                showsVerticalScrollIndicator={false}
              >
                {currentVideos.map(renderVideoItem)}
                {currentVideos.length === 0 && (
                  <View style={[styles.blueprintCard, { borderColor: theme.border }]}>
                    <Text style={[styles.blueprintTitle, { color: theme.primary }]}>
                      INTEL RECON EMPTY
                    </Text>
                    <Text style={[styles.blueprintBody, { color: theme.textSecondary }]}>
                      Tap the {"\"+\""} button to register clip guides for {selectedOperator.name} on {selectedMap.name}.
                    </Text>
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top', 'left', 'right']}>
      {/* Top Banner App Title */}
      <ThemedView type="backgroundElement" style={styles.topHeader}>
        <View style={styles.headerInfo}>
          <Text style={[styles.brandTitle, { color: theme.text }]}>
            R6 <Text style={{ color: theme.primary }}>COMPANION</Text>
          </Text>
          <Text style={[styles.brandTagline, { color: theme.textSecondary }]}>
            Tactical Utility & Strategic Database
          </Text>
        </View>

        {__DEV__ && (
          <Pressable
            style={({ pressed }) => [
              styles.testShareBtn,
              { borderColor: theme.primary, opacity: pressed ? 0.7 : 1, marginRight: Spacing.two }
            ]}
            onPress={() => {
              setMockShareIntent({
                type: 'weburl',
                value: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
              });
            }}
          >
            <Text style={{ color: theme.primary, fontSize: 9, fontWeight: '800' }}>TEST SHARE</Text>
          </Pressable>
        )}

        {/* Global Reset */}
        {(selectedMapId || selectedOperatorId) && (
          <Pressable
            style={({ pressed }) => [
              styles.resetBtn,
              { borderColor: theme.primary, opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={resetSelection}
          >
            <Text style={[styles.resetBtnText, { color: theme.primary }]}>RESET</Text>
          </Pressable>
        )}
      </ThemedView>

      {/* Main Grid View */}
      {isDesktop ? renderDesktopLayout() : renderMobileLayout()}

      {/* ADD TACTICAL CLIP MODAL */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <ThemedView type="backgroundElement" style={[styles.modalCard, { borderColor: theme.border }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: theme.text }]}>ADD STRAT intel</Text>
                {selectedOperator && selectedMap && (
                  <Text style={[styles.modalSubtitle, { color: theme.primary }]}>
                    Target: {selectedOperator.name} @ {selectedMap.name}
                  </Text>
                )}
              </View>
              <Pressable
                style={({ pressed }) => [styles.modalCloseBtn, pressed && { opacity: 0.7 }]}
                onPress={() => {
                  setLinkHeadline('');
                  setLinkUrl('');
                  setIsModalOpen(false);
                }}
              >
                <TacticalIcon name="close" color={theme.text} size={16} />
              </Pressable>
            </View>

            <View style={styles.modalForm}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                  CLIP HEADLINE / TITLE
                </Text>
                <TextInput
                  style={[styles.modalInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                  placeholder="e.g. Clubhouse Attic Cam Spot"
                  placeholderTextColor={theme.textSecondary}
                  value={linkHeadline}
                  onChangeText={setLinkHeadline}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                  VIDEO URL (YOUTUBE, TIKTOK, TWITCH, ETC.)
                </Text>
                <TextInput
                  style={[styles.modalInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                  placeholder="https://www.youtube.com/watch?v=..."
                  placeholderTextColor={theme.textSecondary}
                  value={linkUrl}
                  onChangeText={setLinkUrl}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                />
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.submitBtn,
                  { backgroundColor: theme.primary, opacity: pressed ? 0.9 : 1 },
                ]}
                onPress={handleAddLink}
              >
                <Text style={styles.submitBtnText}>CONFIRM CLIP DATA</Text>
              </Pressable>
            </View>
          </ThemedView>
        </View>
      </Modal>

      {/* RECEIVE SHARE INTEL MODAL */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={hasActiveShareIntent && !!shareValue}
        onRequestClose={handleResetShareIntent}
      >
        <View style={styles.modalOverlay}>
          <ThemedView type="backgroundElement" style={[styles.modalCard, { borderColor: theme.border }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: theme.text }]}>REGISTER SHARED STRAT</Text>
                <Text style={[styles.modalSubtitle, { color: theme.primary }]}>
                  Identify tactical coordinates below
                </Text>
              </View>
              <Pressable
                style={({ pressed }) => [styles.modalCloseBtn, pressed && { opacity: 0.7 }]}
                onPress={handleResetShareIntent}
              >
                <TacticalIcon name="close" color={theme.text} size={16} />
              </Pressable>
            </View>

            <View style={styles.modalForm}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                  SHARED VIDEO LINK
                </Text>
                <TextInput
                  style={[styles.modalInput, { color: theme.textSecondary, borderColor: theme.border, backgroundColor: theme.background, opacity: 0.7 }]}
                  value={shareValue}
                  editable={false}
                  selectTextOnFocus={true}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                  CLIP HEADLINE / TITLE
                </Text>
                <TextInput
                  style={[styles.modalInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                  placeholder="e.g. Valkyrie Cam Spot or Sledge Angle"
                  placeholderTextColor={theme.textSecondary}
                  value={shareHeadline}
                  onChangeText={setShareHeadline}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                  TARGET MAP
                </Text>

                {/* Search Map Bar */}
                <View style={[styles.searchWrapper, { marginHorizontal: 0, marginBottom: Spacing.one }]}>
                  <TacticalIcon name="search" color={theme.textSecondary} size={14} />
                  <TextInput
                    style={[styles.searchInput, { color: theme.text, backgroundColor: theme.background, height: 28, fontSize: 12 }]}
                    placeholder="Search maps..."
                    placeholderTextColor={theme.textSecondary}
                    value={shareMapSearch}
                    onChangeText={setShareMapSearch}
                  />
                  {shareMapSearch.length > 0 && (
                    <Pressable onPress={() => setShareMapSearch('')}>
                      <TacticalIcon name="close" color={theme.textSecondary} size={12} />
                    </Pressable>
                  )}
                </View>

                <ScrollView key={shareMapSearch} horizontal showsHorizontalScrollIndicator={false} style={styles.shareSelectionScroll} removeClippedSubviews={false}>
                  {filteredShareMaps.map((map) => {
                    const isSelected = shareMapId === map.id;
                    return (
                      <Pressable
                        key={map.id}
                        style={[
                          styles.shareSelectableCard,
                          {
                            borderColor: isSelected ? theme.primary : theme.border,
                            backgroundColor: isSelected ? 'rgba(32, 138, 239, 0.1)' : theme.backgroundElement
                          }
                        ]}
                        onPress={() => setShareMapId(map.id)}
                      >
                        <Text style={{ color: isSelected ? theme.primary : '#fff', fontSize: 11, fontWeight: '700' }}>
                          {map.name.toUpperCase()}
                        </Text>
                      </Pressable>
                    );
                  })}
                  {filteredShareMaps.length === 0 && (
                    <Text style={{ color: theme.textSecondary, fontSize: 11, paddingVertical: Spacing.two }}>No maps match search</Text>
                  )}
                </ScrollView>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                  TACTICAL OPERATOR
                </Text>

                {/* Search Operator Bar */}
                <View style={[styles.searchWrapper, { marginHorizontal: 0, marginBottom: Spacing.one }]}>
                  <TacticalIcon name="search" color={theme.textSecondary} size={14} />
                  <TextInput
                    style={[styles.searchInput, { color: theme.text, backgroundColor: theme.background, height: 28, fontSize: 12 }]}
                    placeholder="Search operators..."
                    placeholderTextColor={theme.textSecondary}
                    value={shareOpSearch}
                    onChangeText={setShareOpSearch}
                  />
                  {shareOpSearch.length > 0 && (
                    <Pressable onPress={() => setShareOpSearch('')}>
                      <TacticalIcon name="close" color={theme.textSecondary} size={12} />
                    </Pressable>
                  )}
                </View>

                <ScrollView key={shareOpSearch} horizontal showsHorizontalScrollIndicator={false} style={styles.shareSelectionScroll} removeClippedSubviews={false}>
                  {filteredShareOperators.map((op) => {
                    const isSelected = shareOperatorId === op.id;
                    const isAttacker = op.role === 'attacker';
                    const roleColor = isAttacker ? theme.attacker : theme.defender;
                    return (
                      <Pressable
                        key={op.id}
                        style={[
                          styles.shareSelectableCard,
                          {
                            borderColor: isSelected ? theme.primary : theme.border,
                            backgroundColor: isSelected ? 'rgba(32, 138, 239, 0.1)' : theme.backgroundElement
                          }
                        ]}
                        onPress={() => setShareOperatorId(op.id)}
                      >
                        <Text style={{ color: isSelected ? theme.primary : '#fff', fontSize: 11, fontWeight: '700' }}>
                          {op.name.toUpperCase()}
                        </Text>
                        <Text style={{ color: roleColor, fontSize: 8, marginTop: 2, fontWeight: '800' }}>
                          {op.role.toUpperCase()}
                        </Text>
                      </Pressable>
                    );
                  })}
                  {filteredShareOperators.length === 0 && (
                    <Text style={{ color: theme.textSecondary, fontSize: 11, paddingVertical: Spacing.two }}>No operators match search</Text>
                  )}
                </ScrollView>
              </View>

              <View style={styles.modalActions}>
                <Pressable
                  style={({ pressed }) => [
                    styles.modalActionBtn,
                    { borderColor: theme.border, opacity: pressed ? 0.7 : 1 }
                  ]}
                  onPress={handleResetShareIntent}
                >
                  <Text style={{ color: theme.text, fontSize: 11, fontWeight: '800', letterSpacing: 0.5 }}>CANCEL</Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.modalActionBtn,
                    {
                      backgroundColor: theme.primary,
                      borderColor: theme.primary,
                      opacity: pressed ? 0.8 : 1
                    }
                  ]}
                  onPress={async () => {
                    if (!shareValue) return;
                    if (!shareHeadline.trim()) {
                      Alert.alert('Validation Error', 'Please enter a headline.');
                      return;
                    }
                    if (!shareMapId) {
                      Alert.alert('Validation Error', 'Please select a target map.');
                      return;
                    }
                    if (!shareOperatorId) {
                      Alert.alert('Validation Error', 'Please select an operator.');
                      return;
                    }
                    
                    await addLink(shareMapId, shareOperatorId, shareHeadline, shareValue);
                    Alert.alert('Success', 'Strat registered successfully!');
                    handleResetShareIntent();
                  }}
                >
                  <Text style={{ color: '#000', fontSize: 11, fontWeight: '900', letterSpacing: 0.5 }}>REGISTER STRAT</Text>
                </Pressable>
              </View>
            </View>
          </ThemedView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topHeader: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  headerInfo: {
    flex: 1,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  brandTagline: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  resetBtn: {
    borderWidth: 1,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: 4,
  },
  resetBtnText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  testShareBtn: {
    borderWidth: 1,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Desktop columns styling
  desktopContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  desktopColumn: {
    height: '100%',
    paddingVertical: Spacing.three,
  },
  columnHeader: {
    paddingHorizontal: Spacing.three,
    marginBottom: Spacing.three,
  },
  columnTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
  columnSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#303030',
    borderRadius: 6,
    paddingHorizontal: Spacing.two,
    paddingVertical: Platform.OS === 'ios' ? 8 : 6,
    marginHorizontal: Spacing.three,
    marginBottom: Spacing.three,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    paddingLeft: Spacing.two,
    paddingVertical: 0,
    height: 32,
  },
  scrollList: {
    paddingHorizontal: Spacing.three,
    gap: Spacing.two,
  },
  mapCard: {
    height: 80,
    borderWidth: 1,
    borderRadius: 6,
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  mapCardContent: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    zIndex: 2,
  },
  mapHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  mapName: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  activeIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },

  // Operator selection panel
  columnPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
    opacity: 0.6,
  },
  placeholderTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: Spacing.three,
    marginBottom: Spacing.one,
  },
  placeholderBody: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    marginBottom: Spacing.three,
    gap: Spacing.two,
  },
  roleFilterContainer: {
    flexDirection: 'row',
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#303030',
  },
  filterTab: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterTabText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  opGrid: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.five,
  },
  opTile: {
    width: '48%', // dynamic flexbox sizing
    borderWidth: 1,
    borderRadius: 6,
    padding: Spacing.two,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
    paddingVertical: Spacing.three,
  },
  opRoleBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  opClipBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  opClipBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    textAlign: 'center',
  },
  opAvatar: {
    width: 44,
    height: 44,
    borderRadius: 6,
    marginBottom: Spacing.two,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  opName: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  opRoleText: {
    fontSize: 8,
    fontWeight: '800',
    marginTop: Spacing.one,
    letterSpacing: 0.5,
  },
  opCheckIcon: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Videos links panel
  videosContainer: {
    flex: 1,
  },
  dossierBanner: {
    height: 110,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: Spacing.three,
    justifyContent: 'center',
    position: 'relative',
  },
  dossierContent: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
    zIndex: 2,
  },
  dossierOpAvatar: {
    width: 64,
    height: 64,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  dossierTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  dossierSubtitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 2,
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  videosHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    marginBottom: Spacing.three,
    gap: Spacing.two,
  },
  intelMainHeading: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  intelSubHeading: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '600',
  },
  addFloatingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: Spacing.three,
    borderRadius: 4,
    gap: Spacing.one,
  },
  addBtnLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#000',
  },
  videosScroll: {
    paddingHorizontal: Spacing.three,
    gap: Spacing.three,
    paddingBottom: Spacing.six,
  },
  videoCard: {
    borderWidth: 1,
    borderRadius: 6,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  videoInfo: {
    gap: Spacing.one,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  platformBadge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
    borderRadius: 4,
  },
  platformBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#fff',
  },
  addedAtText: {
    fontSize: 10,
    fontWeight: '500',
  },
  videoHeadline: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
  },
  videoUrlText: {
    fontSize: 11,
  },
  videoActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
  },
  watchButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 4,
    gap: Spacing.one,
  },
  watchButtonText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#000',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 4,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blueprintCard: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 6,
    padding: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.two,
  },
  blueprintTitle: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: Spacing.one,
  },
  blueprintBody: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },

  // Mobile Styles
  mobileContainer: {
    flex: 1,
  },
  mobilePanel: {
    flex: 1,
  },
  mobileHeader: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    marginBottom: Spacing.one,
  },
  mobileTitle: {
    fontSize: 16,
    fontWeight: '950',
    letterSpacing: 0.5,
  },
  mobileSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  mobileScrollContent: {
    paddingHorizontal: Spacing.three,
    gap: Spacing.two,
    paddingBottom: BottomTabInset + 40,
  },
  breadcrumbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    gap: Spacing.two,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingRight: Spacing.two,
  },
  backBtnText: {
    fontSize: 11,
    fontWeight: '800',
  },
  breadcrumbText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  mobileFilterBar: {
    paddingHorizontal: Spacing.three,
    marginBottom: Spacing.three,
    gap: Spacing.one,
  },
  mobileOpGridContent: {
    paddingHorizontal: Spacing.three,
    paddingBottom: BottomTabInset + 40,
  },
  addFloatingBtnMobile: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileVideosScroll: {
    paddingHorizontal: Spacing.three,
    gap: Spacing.three,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  modalCard: {
    width: '100%',
    maxWidth: 450,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: Spacing.three,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  modalSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: Spacing.one,
  },
  modalForm: {
    padding: Spacing.three,
    gap: Spacing.three,
  },
  inputGroup: {
    gap: Spacing.one,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: Spacing.three,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    fontSize: 13,
  },
  submitBtn: {
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.two,
  },
  submitBtnText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: Spacing.four,
  },
  shareSelectionScroll: {
    marginVertical: Spacing.one,
    paddingVertical: Spacing.one,
  },
  shareSelectableCard: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: 6,
    borderWidth: 1,
    marginRight: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 90,
  },
  modalActionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.three,
  },
});
