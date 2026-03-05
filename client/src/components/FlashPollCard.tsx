import { useEffect, useMemo, useState } from "react";
import { BarChart3, Vote } from "lucide-react";
import { fetchCurrentFlashPoll, voteFlashPoll } from "@/lib/flashPollApi";
import type { FlashPoll } from "@shared/polls";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const REFRESH_INTERVAL_MS = 5000;
const VOTED_POLLS_STORAGE_KEY = "smart-entry-voted-polls";

interface FlashPollCardProps {
  fanId: string;
}

function getVotedPolls(): Record<string, string[]> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(VOTED_POLLS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, string[]>;
    return parsed ?? {};
  } catch {
    return {};
  }
}

function markPollAsVoted(fanId: string, pollId: string) {
  if (typeof window === "undefined") return;
  const store = getVotedPolls();
  const fanPolls = new Set(store[fanId] ?? []);
  fanPolls.add(pollId);
  store[fanId] = Array.from(fanPolls);
  window.localStorage.setItem(VOTED_POLLS_STORAGE_KEY, JSON.stringify(store));
}

function hasVotedInPoll(fanId: string, pollId: string): boolean {
  const store = getVotedPolls();
  return (store[fanId] ?? []).includes(pollId);
}

export function FlashPollCard({ fanId }: FlashPollCardProps) {
  const [poll, setPoll] = useState<FlashPoll | null>(null);
  const [source, setSource] = useState<"server" | "local">("server");
  const [loading, setLoading] = useState(true);
  const [isVoting, setIsVoting] = useState(false);
  const [feedback, setFeedback] = useState<string>("");

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      const payload = await fetchCurrentFlashPoll();
      if (!isActive) return;
      setPoll(payload.poll);
      setSource(payload.source);
      setLoading(false);
    };

    load();
    const interval = setInterval(load, REFRESH_INTERVAL_MS);

    return () => {
      isActive = false;
      clearInterval(interval);
    };
  }, []);

  const voted = useMemo(() => {
    if (!poll) return false;
    return hasVotedInPoll(fanId, poll.id);
  }, [fanId, poll]);

  const handleVote = async (optionId: string) => {
    if (!poll || voted || isVoting) return;
    setIsVoting(true);
    const payload = await voteFlashPoll({
      pollId: poll.id,
      fanId,
      optionId,
    });
    setFeedback(payload.message);
    if (payload.success && payload.poll) {
      markPollAsVoted(fanId, payload.poll.id);
      setPoll(payload.poll);
      setSource(payload.source);
    }
    setIsVoting(false);
  };

  if (loading) {
    return (
      <Card className="shadow-md mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Vote className="w-5 h-5 text-fuchsia-700" />
            التصويت السريع
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">جاري تحميل الاستطلاع...</p>
        </CardContent>
      </Card>
    );
  }

  if (!poll) {
    return (
      <Card className="shadow-md mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Vote className="w-5 h-5 text-fuchsia-700" />
            التصويت السريع
          </CardTitle>
          <CardDescription>لا يوجد استطلاع نشط حالياً.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0);

  return (
    <Card className="shadow-md mb-8 border-fuchsia-200 border-2 bg-gradient-to-br from-fuchsia-50 to-rose-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Vote className="w-5 h-5 text-fuchsia-700" />
          التصويت السريع (Flash Poll)
        </CardTitle>
        <CardDescription className="flex items-center justify-between gap-2">
          <span>صوّت بلمسة واحدة وتظهر النتائج كنسب مباشرة.</span>
          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${source === "server" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
            {source === "server" ? "نتائج حية" : "وضع محلي"}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 rounded-xl border border-fuchsia-200 bg-white/80 p-4">
          <p className="text-sm text-slate-600 mb-1">سؤال اللحظة</p>
          <p className="text-lg font-bold text-slate-900">{poll.question}</p>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 mb-4">
          {poll.options.map(option => (
            <Button
              key={option.id}
              variant={voted ? "outline" : "default"}
              className={voted ? "h-11" : "h-11 bg-fuchsia-700 hover:bg-fuchsia-800"}
              disabled={voted || isVoting}
              onClick={() => handleVote(option.id)}
            >
              {option.text}
            </Button>
          ))}
        </div>

        <div className="space-y-2 rounded-xl border border-fuchsia-200 bg-white/80 p-3">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span className="inline-flex items-center gap-1">
              <BarChart3 className="w-3.5 h-3.5" />
              النتائج الحالية
            </span>
            <span>{totalVotes} صوت</span>
          </div>
          {poll.options.map(option => (
            <div key={option.id}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">{option.text}</span>
                <span className="text-slate-600">{option.percentage}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-200">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-fuchsia-600 to-rose-500 transition-all"
                  style={{ width: `${option.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {feedback && (
          <p className="mt-3 text-sm font-semibold text-slate-700">{feedback}</p>
        )}
      </CardContent>
    </Card>
  );
}
