// ChatScreen.js
import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

// ------------------------
// CONFIG — LOCAL NETWORK
// ------------------------
const BASE_API = "http://192.168.1.40:8080/api"; // REST API
const WS_ENDPOINT = "http://192.168.1.40:8080/ws"; // WebSocket SockJS endpoint
const PAGE_SIZE = 50;

// ------------------------
// Auth helper (JWT or remove if not used)
// ------------------------
async function getAuthHeaders() {
  const token = await AsyncStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ------------------------
// Message item component
// ------------------------
const MessageItem = ({ item, currentUserId }) => {
  const isMe = item.sender?.userId === currentUserId;
  return (
    <View
      style={[
        styles.messageRow,
        isMe ? styles.myMessageRow : styles.theirMessageRow,
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          isMe ? styles.myBubble : styles.theirBubble,
        ]}
      >
        <Text
          style={[styles.messageText, isMe ? styles.myText : styles.theirText]}
        >
          {item.body}
        </Text>
        <Text style={styles.timestamp}>
          {formatTS(item.sentAt || item.createdAt)}
        </Text>
      </View>
    </View>
  );
};

function formatTS(ts) {
  if (!ts) return "";
  try {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

// ------------------------
// ChatScreen Component
// ------------------------
export default function ChatScreen({ route, navigation }) {
  const { jobId, userId: currentUserId, otherUserName } = route.params;
  const [messages, setMessages] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [input, setInput] = useState("");
  const [hasMore, setHasMore] = useState(true);

  const flatListRef = useRef(null);
  const stompClientRef = useRef(null);
  const subscriptionRef = useRef(null);

  useEffect(() => {
    navigation.setOptions({ title: otherUserName || "Chat" });
    loadMessages(0);
    markAllRead();
    connectWebSocket();

    return () => {
      disconnectWebSocket();
    };
  }, [jobId]);

  // ---------------------------
  // API wrappers
  // ---------------------------
  const loadMessages = useCallback(
    async (pageToLoad = 0) => {
      if (!hasMore && pageToLoad !== 0) return;
      setLoading(true);
      try {
        const headers = await getAuthHeaders();
        const res = await axios.get(
          `${BASE_API}/jobs/${jobId}/messages?page=${pageToLoad}&size=${PAGE_SIZE}`,
          { headers }
        );
        const content = res.data?.content || res.data || [];
        const newMessages = content;
        if (pageToLoad === 0) {
          setMessages(newMessages);
        } else {
          setMessages((prev) => [...newMessages, ...prev]);
        }
        setPage(pageToLoad);
        setHasMore((newMessages.length ?? 0) >= PAGE_SIZE);
      } catch (err) {
        console.warn("loadMessages error", err?.response?.data ?? err.message);
      } finally {
        setLoading(false);
        if (pageToLoad === 0) setTimeout(() => scrollToBottom(), 150);
      }
    },
    [jobId, hasMore]
  );

  const sendMessageToServer = async (text) => {
    const headers = await getAuthHeaders();
    return axios.post(
      `${BASE_API}/jobs/${jobId}/chat`,
      { senderId: currentUserId, body: text },
      { headers }
    );
  };

  const markAllRead = async () => {
    try {
      const headers = await getAuthHeaders();
      await axios.post(
        `${BASE_API}/jobs/${jobId}/chat/mark-read`,
        { userId: currentUserId },
        { headers }
      );
    } catch (err) {}
  };

  // ---------------------------
  // WebSocket / STOMP
  // ---------------------------
  const connectWebSocket = async () => {
    const client = new Client({
      webSocketFactory: () => new SockJS(WS_ENDPOINT),
      connectHeaders: async () => {
        const token = await AsyncStorage.getItem("accessToken");
        return token ? { Authorization: `Bearer ${token}` } : {};
      },
      debug: () => {},
      onConnect: () => {
        const topic = `/topic/jobs/${jobId}/chat`;
        subscriptionRef.current = client.subscribe(topic, (message) => {
          if (!message.body) return;
          try {
            const payload = JSON.parse(message.body);
            handleIncomingMessage(payload);
          } catch (e) {
            console.warn("Invalid WS payload", e, message.body);
          }
        });
      },
      onStompError: (frame) => console.error("STOMP error", frame),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });
    stompClientRef.current = client;
    client.activate();
  };

  const disconnectWebSocket = () => {
    subscriptionRef.current?.unsubscribe?.();
    stompClientRef.current?.deactivate?.();
    subscriptionRef.current = null;
    stompClientRef.current = null;
  };

  const handleIncomingMessage = (payload) => {
    setMessages((prev) => {
      if (payload.id && prev.some((m) => m.id === payload.id)) return prev;
      return [...prev, payload];
    });
    setTimeout(() => scrollToBottom(), 100);
  };

  // ---------------------------
  // Send handler
  // ---------------------------
  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;
    setSending(true);
    const optimisticId = `temp-${Date.now()}`;
    const optimisticMsg = {
      id: optimisticId,
      body: text,
      sender: { userId: currentUserId },
      receiver: {},
      sentAt: new Date().toISOString(),
      isRead: false,
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    setInput("");
    scrollToBottom();

    try {
      const res = await sendMessageToServer(text);
      const saved = res.data;
      setMessages((prev) =>
        prev.map((m) => (m.id === optimisticId ? saved : m))
      );
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      console.warn("sendMessage error", err?.response?.data ?? err.message);
    } finally {
      setSending(false);
    }
  };

  // ---------------------------
  // Helpers
  // ---------------------------
  const scrollToBottom = () => {
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  const onLoadEarlier = () => {
    const nextPage = page + 1;
    loadMessages(nextPage);
  };

  // ---------------------------
  // Render
  // ---------------------------
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: null })}
        keyboardVerticalOffset={Platform.select({ ios: 90, android: 0 })}
        style={styles.container}
      >
        <View style={styles.listContainer}>
          {loading && page === 0 ? (
            <ActivityIndicator size="large" />
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) =>
                String(item.id ?? item.tempId ?? Math.random())
              }
              renderItem={({ item }) => (
                <MessageItem item={item} currentUserId={currentUserId} />
              )}
              onContentSizeChange={() => scrollToBottom()}
              onLayout={() => scrollToBottom()}
              onEndReachedThreshold={0.1}
              ListHeaderComponent={() =>
                hasMore ? (
                  <TouchableOpacity
                    style={styles.loadEarlierBtn}
                    onPress={onLoadEarlier}
                  >
                    <Text style={styles.loadEarlierText}>
                      Load earlier messages
                    </Text>
                  </TouchableOpacity>
                ) : null
              }
            />
          )}
        </View>

        <View style={styles.inputRow}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Type a message..."
            style={styles.input}
            multiline
            editable={!sending}
          />
          <TouchableOpacity
            style={styles.sendBtn}
            onPress={handleSend}
            disabled={sending}
          >
            <Text style={styles.sendText}>{sending ? "..." : "Send"}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ------------------------
// Styles
// ------------------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  listContainer: { flex: 1, padding: 10 },
  messageRow: { marginVertical: 6, flexDirection: "row" },
  myMessageRow: { justifyContent: "flex-end" },
  theirMessageRow: { justifyContent: "flex-start" },
  messageBubble: {
    maxWidth: "80%",
    padding: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  myBubble: { backgroundColor: "#0b93f6", borderTopRightRadius: 2 },
  theirBubble: { backgroundColor: "#f1f0f0", borderTopLeftRadius: 2 },
  messageText: { fontSize: 16 },
  myText: { color: "#fff" },
  theirText: { color: "#000" },
  timestamp: {
    marginTop: 6,
    fontSize: 10,
    color: "#666",
    alignSelf: "flex-end",
  },

  inputRow: {
    flexDirection: "row",
    padding: 8,
    borderTopColor: "#eee",
    borderTopWidth: 1,
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#fafafa",
    borderRadius: 20,
    fontSize: 16,
  },
  sendBtn: {
    marginLeft: 8,
    backgroundColor: "#0b93f6",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: "center",
  },
  sendText: { color: "#fff", fontWeight: "600" },

  loadEarlierBtn: {
    alignSelf: "center",
    marginVertical: 8,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: "#f0f0f0",
  },
  loadEarlierText: { color: "#333" },
});
