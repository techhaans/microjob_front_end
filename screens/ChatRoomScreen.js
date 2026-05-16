import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { fetchChatMessages, sendChatMessage } from "../api/chat";

export default function ChatRoomScreen({ route }) {
  const { jobId, currentUserId } = route.params || {};
  const userId = String(currentUserId || "");

  const [messages, setMessages] = useState([]); // ✅ RAW messages only
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState("");

  const lastMessageIdRef = useRef(null);
  const flatListRef = useRef(null);

  /* ===============================
     LOAD MESSAGES (SAFE)
  =============================== */
  const loadMessages = async () => {
    try {
      const msgs = await fetchChatMessages(jobId);

      msgs.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

      setMessages((prev) => {
        const lastId = lastMessageIdRef.current;
        const fresh = lastId ? msgs.filter((m) => m.id > lastId) : msgs;

        if (fresh.length === 0) return prev;

        lastMessageIdRef.current = fresh[fresh.length - 1].id;
        return lastId ? [...prev, ...fresh] : fresh;
      });
    } catch (err) {
      console.warn("Load failed:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     INITIAL LOAD + POLLING
  =============================== */
  useEffect(() => {
    loadMessages();

    const interval = setInterval(loadMessages, 3000);

    return () => {
      clearInterval(interval); // ✅ CLEANUP
    };
  }, [jobId]);

  /* ===============================
     SEND MESSAGE
  =============================== */
  const handleSend = async () => {
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      await sendChatMessage(jobId, newMessage.trim());
      setNewMessage("");
      loadMessages();
    } catch (err) {
      console.warn("Send failed:", err);
    } finally {
      setSending(false);
    }
  };

  /* ===============================
     DATE GROUPING (MEMOIZED)
  =============================== */
  const groupedMessages = useMemo(() => {
    let list = [];
    let lastDate = "";

    messages.forEach((msg) => {
      const msgDate = new Date(msg.createdAt);
      const today = new Date();

      const sameDay = (a, b) => a.toDateString() === b.toDateString();

      let label = "";
      if (sameDay(msgDate, today)) label = "Today";
      else {
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
        label = sameDay(msgDate, yesterday)
          ? "Yesterday"
          : msgDate.toLocaleDateString();
      }

      if (label !== lastDate) {
        list.push({ id: `date-${label}`, type: "date", label });
        lastDate = label;
      }

      list.push({ ...msg, type: "message" });
    });

    return list;
  }, [messages]);

  /* ===============================
     RENDER MESSAGE
  =============================== */
  const renderItem = ({ item, index }) => {
    if (item.type === "date") {
      return (
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>{item.label}</Text>
        </View>
      );
    }

    const isMe = String(item.senderId) === userId;
    const prev = groupedMessages[index - 1];
    const sameSender =
      prev?.type === "message" && prev.senderId === item.senderId;

    return (
      <View
        style={[
          styles.messageContainer,
          isMe ? styles.messageRight : styles.messageLeft,
          { marginTop: sameSender ? 2 : 10 },
        ]}
      >
        {!sameSender && (
          <Text style={styles.senderLabel}>{isMe ? "You →" : "Friend →"}</Text>
        )}

        <View
          style={[styles.bubble, isMe ? styles.bubbleRight : styles.bubbleLeft]}
        >
          <Text style={[styles.messageText, isMe && { color: "#fff" }]}>
            {item.body}
          </Text>
          <Text style={styles.messageTime}>
            {new Date(item.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#ece5dd" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={groupedMessages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 10, paddingBottom: 20 }}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSend}
          disabled={sending}
        >
          <Text style={{ color: "#fff", fontWeight: "600" }}>
            {sending ? "..." : "Send"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

/* ===============================
   STYLES
=============================== */
const styles = {
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  messageContainer: { maxWidth: "80%" },
  messageLeft: { alignSelf: "flex-start" },
  messageRight: { alignSelf: "flex-end" },

  bubble: { padding: 10, borderRadius: 16 },
  bubbleLeft: { backgroundColor: "#f1f0f0" },
  bubbleRight: { backgroundColor: "#34b7f1" },

  messageText: { fontSize: 16, color: "#333" },
  messageTime: { fontSize: 11, color: "#eee", alignSelf: "flex-end" },

  dateContainer: {
    alignSelf: "center",
    padding: 6,
    backgroundColor: "#d3d3d3",
    borderRadius: 6,
    marginVertical: 10,
  },
  dateText: { fontSize: 12, color: "#333" },

  senderLabel: { fontSize: 12, color: "#555", marginBottom: 2 },

  inputContainer: {
    flexDirection: "row",
    padding: 8,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#ccc",
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 45,
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: "#34b7f1",
    borderRadius: 25,
    paddingHorizontal: 15,
    justifyContent: "center",
  },
};
