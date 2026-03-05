import { useEffect, useMemo, useState } from "react";
import { MessageCircle, Send, Users } from "lucide-react";
import { fetchChatMessages, sendChatMessage } from "@/lib/chatApi";
import type { FanChatMessage } from "@shared/chat";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const REFRESH_INTERVAL_MS = 5000;

interface FanChatRoomProps {
  fanId: string;
  fanName: string;
  room?: string;
}

export function FanChatRoom({ fanId, fanName, room = "match-main" }: FanChatRoomProps) {
  const [messages, setMessages] = useState<FanChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [source, setSource] = useState<"server" | "local">("server");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const quickMessages = [
    "من تتوقع يسجل الهدف القادم؟",
    "الأجواء ممتازة اليوم!",
    "أي بوابة أسرع الآن؟",
  ];

  const onlineEstimate = useMemo(() => {
    const uniqueFans = new Set(messages.map(message => message.fanId));
    return Math.max(1, uniqueFans.size);
  }, [messages]);

  useEffect(() => {
    let isActive = true;

    const loadMessages = async () => {
      const payload = await fetchChatMessages(room, 60);
      if (!isActive) return;
      setMessages(payload.messages);
      setSource(payload.source);
      setLoading(false);
    };

    loadMessages();
    const interval = setInterval(loadMessages, REFRESH_INTERVAL_MS);

    return () => {
      isActive = false;
      clearInterval(interval);
    };
  }, [room]);

  const sendMessage = async (text: string) => {
    const normalizedText = text.trim();
    if (!normalizedText || sending) return;

    setSending(true);
    const payload = await sendChatMessage({
      room,
      fanId,
      fanName,
      message: normalizedText,
    });
    if (payload.success) {
      const latest = await fetchChatMessages(room, 60);
      setMessages(latest.messages);
      setSource(latest.source);
      setDraft("");
    }
    setSending(false);
  };

  return (
    <Card className="shadow-md mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-indigo-700" />
          تفاعل الجماهير المباشر
        </CardTitle>
        <CardDescription className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1">
            <Users className="w-4 h-4" />
            {onlineEstimate} متواجدين
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
              source === "server" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
            }`}
          >
            {source === "server" ? "مباشر من الخادم" : "وضع محلي"}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-wrap gap-2">
          {quickMessages.map(quickMessage => (
            <Button
              key={quickMessage}
              variant="outline"
              className="h-8 text-xs"
              disabled={sending}
              onClick={() => sendMessage(quickMessage)}
            >
              {quickMessage}
            </Button>
          ))}
        </div>

        <div className="mb-4 max-h-80 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/70 p-3">
          {loading && (
            <p className="py-6 text-center text-sm text-slate-500">جاري تحميل المحادثة...</p>
          )}
          {!loading && messages.length === 0 && (
            <p className="py-6 text-center text-sm text-slate-500">
              لا توجد رسائل بعد. ابدأ النقاش مع الجماهير الآن.
            </p>
          )}
          <div className="space-y-2">
            {messages.map(message => {
              const isOwn = message.fanId === fanId;
              return (
                <div key={message.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-xl px-3 py-2 ${
                      isOwn ? "bg-blue-700 text-white" : "bg-white border border-slate-200 text-slate-900"
                    }`}
                  >
                    <p className={`text-[11px] font-semibold ${isOwn ? "text-blue-100" : "text-slate-500"}`}>
                      {isOwn ? "أنت" : message.fanName}
                    </p>
                    <p className="text-sm leading-relaxed mt-0.5">{message.message}</p>
                    <p className={`text-[10px] mt-1 ${isOwn ? "text-blue-100/80" : "text-slate-400"}`}>
                      {new Date(message.createdAt).toLocaleTimeString("ar-SA", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Input
            value={draft}
            onChange={event => setDraft(event.target.value)}
            onKeyDown={event => {
              if (event.key === "Enter") {
                event.preventDefault();
                sendMessage(draft);
              }
            }}
            placeholder="اكتب رسالتك للجماهير..."
            maxLength={280}
          />
          <Button
            className="bg-indigo-700 hover:bg-indigo-800"
            disabled={sending || draft.trim().length === 0}
            onClick={() => sendMessage(draft)}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
