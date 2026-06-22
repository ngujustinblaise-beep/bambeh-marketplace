import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Platform, Dimensions, SafeAreaView, ScrollView } from 'react-native';
import { WebView } from 'react-native-webview';

interface Tutorial { id: string; title: string; description: string; embedUrl: string; }
interface VideoTutorialProps { tutorials?: Tutorial[]; onVideoError?: (id: string, error: Error) => void; onVideoLoad?: (id: string) => void; }

const isWeb = Platform.OS === 'web';

function sanitizeEmbedUrl(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmedUrl = url.trim();
  if (trimmedUrl.includes('/watch?v=')) {
    const parts = trimmedUrl.split('watch?v=');
    if (parts.length > 1) return 'https://www.youtube.com/embed/' + parts[1].split('&')[0];
  }
  return trimmedUrl.includes('/embed/') ? trimmedUrl : 'https://www.youtube.com/embed/' + trimmedUrl.split('/').pop();
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#f9f9f9', minHeight: Dimensions.get('window').height },
  headerBanner: { backgroundColor: '#7A1FA2', padding: 24, borderRadius: 12, flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  icon: { fontSize: 32, marginRight: 16 },
  headerTitleWrapper: { flex: 1 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#ffffff' },
  headerSubtitle: { fontSize: 14, color: '#ffffff', opacity: 0.8, marginTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { backgroundColor: '#ffffff', borderRadius: 12, overflow: 'hidden', marginBottom: 20, width: Dimensions.get('window').width < 600 ? Dimensions.get('window').width - 32 : Math.min(320, (Dimensions.get('window').width - 40) / 2) },
  videoContainer: { width: '100%', height: 0, paddingBottom: '56.25%', backgroundColor: '#000', position: 'relative' },
  webView: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  iframe: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
  cardBody: { padding: 16 },
  videoTitle: { fontSize: 18, color: '#333333', fontWeight: '600', marginBottom: 8 },
  videoDescription: { fontSize: 14, color: '#666666', lineHeight: 20 },
  emptyState: { padding: '48px 24px', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: 12 },
  loadingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1a1a1a' },
  spinner: { width: 40, height: 40, borderRadius: 20, borderWidth: 4, borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff', marginBottom: 12 },
  loadingText: { fontSize: 14, color: '#fff' },
  fallbackContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1a1a1a', padding: 24 },
  fallbackIcon: { fontSize: 48, marginBottom: 12 },
  fallbackText: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 8 },
  fallbackSubtext: { fontSize: 13, color: '#fff', opacity: 0.7, textAlign: 'center' },
});

function VideoCard({ tutorial, onError, onLoad }: { tutorial: Tutorial; onError: (id: string, error: Error) => void; onLoad: (id: string) => void; }) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [displayUrl, setDisplayUrl] = useState<string | null>(null);
  useEffect(() => { const sanitized = sanitizeEmbedUrl(tutorial.embedUrl); if (sanitized) setDisplayUrl(sanitized); else { setHasError(true); onError(tutorial.id, new Error('Invalid URL')); } }, [tutorial.embedUrl, tutorial.id, onError]);
  const handleError = useCallback(() => { setIsLoading(false); setHasError(true); onError(tutorial.id, new Error('Failed to load')); }, [tutorial.id, onError]);
  const handleLoad = useCallback(() => { setIsLoading(false); if (!hasError) onLoad(tutorial.id); }, [tutorial.id, onLoad, hasError]);
  const fallback = (<View style={styles.fallbackContainer}><Text style={styles.fallbackIcon}>🎬</Text><Text style={styles.fallbackText}>Video unavailable</Text><Text style={styles.fallbackSubtext}>{tutorial.title}</Text></View>);
  if (isWeb) return (<View style={styles.card}><View style={styles.videoContainer}>{isLoading && (<View style={styles.loadingOverlay}><View style={styles.spinner} /><Text style={styles.loadingText}>Loading...</Text></View>)}{hasError || !displayUrl ? fallback : (<iframe src={displayUrl} title={tutorial.title} frameBorder="0" allow="fullscreen" onLoad={handleLoad} onError={handleError} style={styles.iframe} sandbox="allow-scripts allow-same-origin" />)}</View><View style={styles.cardBody}><Text style={styles.videoTitle}>{tutorial.title}</Text><Text style={styles.videoDescription}>{tutorial.description}</Text></View></View>);
  return (<View style={styles.card}><View style={styles.videoContainer}>{isLoading && (<View style={styles.loadingOverlay}><View style={styles.spinner} /><Text style={styles.loadingText}>Loading...</Text></View>)}{hasError || !displayUrl ? fallback : (<WebView source={{ uri: displayUrl }} style={styles.webView} javascriptEnabled={true} mediaPlaybackRequiresUserAction={false} allowsFullscreenVideo={true} onError={handleError} onLoadEnd={handleLoad} />)}</View><View style={styles.cardBody}><Text style={styles.videoTitle}>{tutorial.title}</Text><Text style={styles.videoDescription}>{tutorial.description}</Text></View></View>);
}

export default function VideoTutorials({ tutorials = [], onVideoError, onVideoLoad }: VideoTutorialProps) {
  const finalTutorials = useMemo(() => { if (!tutorials || !Array.isArray(tutorials)) return [{ id: "1", title: "How to use the Market Place", description: "Learn how to list items, buy, and interact with sellers safely on Bambeh.", embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" }, { id: "2", title: "Understanding Njangi Groups", description: "A deep dive into managing your collective savings cycles smoothly.", embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" }]; return tutorials.map((t: any) => ({ id: t.id, title: t.title, description: t.description, embedUrl: sanitizeEmbedUrl(t.embedUrl) || '' })).filter((t) => t.id && t.embedUrl); }, [tutorials]);
  const handleError = useCallback((id: string, error: Error) => { onVideoError?.(id, error); }, [onVideoError]);
  const handleLoad = useCallback((id: string) => { onVideoLoad?.(id); }, [onVideoLoad]);
  return (<SafeAreaView style={styles.container}><View style={styles.headerBanner}><Text style={styles.icon}>📹</Text><View style={styles.headerTitleWrapper}><Text style={styles.headerTitle}>Video Tutorials</Text><Text style={styles.headerSubtitle}>Watch and learn</Text></View></View>{finalTutorials.length === 0 ? (<View style={styles.emptyState}><Text>No tutorials available</Text></View>) : (<ScrollView style={styles.grid} contentContainerStyle={styles.grid}>{finalTutorials.map((t) => (<VideoCard key={t.id} tutorial={t} onError={handleError} onLoad={handleLoad} />))}</ScrollView>)}</SafeAreaView>);
}




