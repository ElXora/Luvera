"use client";

import {
  ActionBarPrimitive,
  BranchPickerPrimitive,
  ComposerPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
} from "@assistant-ui/react";
import type { FC } from "react";
import { useState, useRef, useCallback } from "react";
import {
  ArrowDownIcon, CheckIcon, ChevronLeftIcon, ChevronRightIcon,
  CopyIcon, PencilIcon, RefreshCwIcon, SendHorizontalIcon, MicIcon, MicOffIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MarkdownText } from "@/components/assistant-ui/markdown-text";
import { TooltipIconButton } from "@/components/assistant-ui/tooltip-icon-button";

export const Thread: FC = () => (
  <ThreadPrimitive.Root
    className="bg-background box-border flex h-full flex-col overflow-hidden"
    style={{ ["--thread-max-width" as string]: "42rem" }}
  >
    <ThreadPrimitive.Viewport className="flex h-full flex-col items-center overflow-y-scroll scroll-smooth bg-inherit px-4 pt-8">
      <ThreadWelcome />
      <ThreadPrimitive.Messages components={{ UserMessage, EditComposer, AssistantMessage }} />
      <ThreadPrimitive.If empty={false}>
        <div className="min-h-8 flex-grow" />
      </ThreadPrimitive.If>
      <div className="sticky bottom-0 mt-3 flex w-full max-w-[var(--thread-max-width)] flex-col items-center justify-end rounded-t-lg bg-inherit pb-4">
        <ThreadScrollToBottom />
        <Composer />
      </div>
    </ThreadPrimitive.Viewport>
  </ThreadPrimitive.Root>
);

const ThreadScrollToBottom: FC = () => (
  <ThreadPrimitive.ScrollToBottom asChild>
    <TooltipIconButton tooltip="Scroll to bottom" variant="outline" className="absolute -top-8 rounded-full disabled:invisible">
      <ArrowDownIcon />
    </TooltipIconButton>
  </ThreadPrimitive.ScrollToBottom>
);

const ThreadWelcome: FC = () => (
  <ThreadPrimitive.Empty>
    <div className="flex w-full max-w-[var(--thread-max-width)] flex-grow flex-col">
      <div className="flex w-full flex-grow flex-col items-center justify-center gap-4">
        <svg width="60" height="60" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="24" fill="url(#twg)"/>
          <path d="M14 24C14 18 19 14 24 14C29 14 34 18 34 24C34 30 29 34 24 34" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
          <circle cx="24" cy="24" r="4" fill="white"/>
          <path d="M24 30L20 37M24 30L28 37" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
          <defs>
            <linearGradient id="twg" x1="0" y1="0" x2="48" y2="48">
              <stop offset="0%" stopColor="#8B5CF6"/>
              <stop offset="100%" stopColor="#5B21B6"/>
            </linearGradient>
          </defs>
        </svg>
        <div className="text-center">
          <p className="text-2xl font-bold tracking-tight">
            Hi, I&apos;m <span className="text-primary">Kroxy</span> 👋
          </p>
          <p className="text-muted-foreground text-sm mt-1.5 max-w-sm">
            Ask me anything — I can search the web 🔍, write code 💻, design thumbnails 🎬, and more.
          </p>
        </div>
      </div>
      <ThreadWelcomeSuggestions />
    </div>
  </ThreadPrimitive.Empty>
);

const ThreadWelcomeSuggestions: FC = () => (
  <div className="mt-4 flex w-full flex-wrap items-stretch justify-center gap-3 pb-2">
    {[
      { prompt: "What's trending on YouTube right now?", label: "🔍 What's trending on YouTube?" },
      { prompt: "Help me create an epic Minecraft YouTube thumbnail concept with dramatic lighting and bold text", label: "⛏️ Minecraft thumbnail idea" },
      { prompt: "Write me a Python Discord bot with /ping and /hello slash commands", label: "🐍 Python Discord bot" },
      { prompt: "Design a Roblox gaming channel banner and icon concept — dark theme, neon colours", label: "🎮 Roblox channel art" },
    ].map(({ prompt, label }) => (
      <ThreadPrimitive.Suggestion
        key={label}
        className="hover:bg-accent hover:border-primary/40 flex max-w-[200px] grow basis-0 flex-col items-center justify-center rounded-xl border p-3 text-center transition-all duration-150 cursor-pointer"
        prompt={prompt}
        method="replace"
        autoSend
      >
        <span className="text-sm font-semibold line-clamp-2">{label}</span>
      </ThreadPrimitive.Suggestion>
    ))}
  </div>
);

// ── Composer with mic button ──
const Composer: FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // We need to inject text into the ComposerPrimitive.Input.
  // We do this by finding the textarea and dispatching a native input event.
  const injectText = useCallback((text: string) => {
    const textarea = document.querySelector<HTMLTextAreaElement>(
      "[data-testid='composer-input'], .aui-composer-input, textarea[placeholder='Message Kroxy...']"
    );
    if (!textarea) return;
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value")?.set;
    nativeInputValueSetter?.call(textarea, text);
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
    textarea.focus();
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setIsTranscribing(true);
        try {
          const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
          const formData = new FormData();
          formData.append("audio", audioBlob, "recording.webm");

          const res = await fetch("/api/transcribe", { method: "POST", body: formData });
          const data = await res.json();

          if (data.text) {
            injectText(data.text);
          } else {
            console.error("Transcription error:", data.error);
          }
        } catch (err) {
          console.error("Transcription failed:", err);
        } finally {
          setIsTranscribing(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Mic access denied:", err);
      alert("Microphone access denied. Please allow mic permissions and try again.");
    }
  }, [injectText]);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  }, []);

  const toggleRecording = useCallback(() => {
    if (isRecording) stopRecording();
    else startRecording();
  }, [isRecording, startRecording, stopRecording]);

  return (
    <ComposerPrimitive.Root className="focus-within:border-primary/40 flex w-full flex-wrap items-end rounded-xl border bg-inherit px-2.5 shadow-sm transition-colors ease-in">
      <ComposerPrimitive.Input
        rows={1}
        autoFocus
        placeholder="Message Kroxy..."
        className="placeholder:text-muted-foreground max-h-40 flex-grow resize-none border-none bg-transparent px-2 py-4 text-sm outline-none focus:ring-0 disabled:cursor-not-allowed"
      />

      {/* Mic button — Groq Whisper STT */}
      <TooltipIconButton
        tooltip={isRecording ? "Stop recording" : isTranscribing ? "Transcribing..." : "Voice input (Groq Whisper)"}
        variant="ghost"
        className={cn(
          "my-2.5 size-8 p-2 transition-all ease-in",
          isRecording && "text-red-500 animate-pulse",
          isTranscribing && "text-primary opacity-60 cursor-not-allowed"
        )}
        onClick={toggleRecording}
        disabled={isTranscribing}
      >
        {isRecording ? <MicOffIcon /> : <MicIcon />}
      </TooltipIconButton>

      <ComposerAction />
    </ComposerPrimitive.Root>
  );
};

const ComposerAction: FC = () => (
  <>
    <ThreadPrimitive.If running={false}>
      <ComposerPrimitive.Send asChild>
        <TooltipIconButton tooltip="Send" variant="default" className="my-2.5 size-8 p-2 transition-opacity ease-in">
          <SendHorizontalIcon />
        </TooltipIconButton>
      </ComposerPrimitive.Send>
    </ThreadPrimitive.If>
    <ThreadPrimitive.If running>
      <ComposerPrimitive.Cancel asChild>
        <TooltipIconButton tooltip="Cancel" variant="default" className="my-2.5 size-8 p-2 transition-opacity ease-in">
          <CircleStopIcon />
        </TooltipIconButton>
      </ComposerPrimitive.Cancel>
    </ThreadPrimitive.If>
  </>
);

const UserMessage: FC = () => (
  <MessagePrimitive.Root className="grid auto-rows-auto grid-cols-[minmax(72px,1fr)_auto] gap-y-2 [&:where(>*)]:col-start-2 w-full max-w-[var(--thread-max-width)] py-4">
    <UserActionBar />
    <div className="bg-primary text-primary-foreground max-w-[calc(var(--thread-max-width)*0.8)] break-words rounded-3xl px-5 py-2.5 col-start-2 row-start-2">
      <MessagePrimitive.Content />
    </div>
    <BranchPicker className="col-span-full col-start-1 row-start-3 -mr-1 justify-end" />
  </MessagePrimitive.Root>
);

const UserActionBar: FC = () => (
  <ActionBarPrimitive.Root hideWhenRunning autohide="not-last" className="flex flex-col items-end col-start-1 row-start-2 mr-3 mt-2.5">
    <ActionBarPrimitive.Edit asChild>
      <TooltipIconButton tooltip="Edit"><PencilIcon /></TooltipIconButton>
    </ActionBarPrimitive.Edit>
  </ActionBarPrimitive.Root>
);

const EditComposer: FC = () => (
  <ComposerPrimitive.Root className="bg-muted my-4 flex w-full max-w-[var(--thread-max-width)] flex-col gap-2 rounded-xl">
    <ComposerPrimitive.Input className="text-foreground flex h-8 w-full resize-none bg-transparent p-4 pb-0 outline-none" />
    <div className="mx-3 mb-3 flex items-center justify-center gap-2 self-end">
      <ComposerPrimitive.Cancel asChild><Button variant="ghost">Cancel</Button></ComposerPrimitive.Cancel>
      <ComposerPrimitive.Send asChild><Button>Send</Button></ComposerPrimitive.Send>
    </div>
  </ComposerPrimitive.Root>
);

const AssistantMessage: FC = () => (
  <MessagePrimitive.Root className="grid grid-cols-[auto_auto_1fr] grid-rows-[auto_1fr] relative w-full max-w-[var(--thread-max-width)] py-4">
    <div className="col-start-1 row-start-1 mr-3 mt-1 flex-shrink-0">
      <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="24" fill="url(#amg)"/>
        <path d="M14 24C14 18 19 14 24 14C29 14 34 18 34 24C34 30 29 34 24 34" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        <circle cx="24" cy="24" r="4" fill="white"/>
        <defs>
          <linearGradient id="amg" x1="0" y1="0" x2="48" y2="48">
            <stop offset="0%" stopColor="#8B5CF6"/>
            <stop offset="100%" stopColor="#5B21B6"/>
          </linearGradient>
        </defs>
      </svg>
    </div>
    <div className="text-foreground max-w-[calc(var(--thread-max-width)*0.8)] break-words leading-7 col-span-2 col-start-2 row-start-1 my-1.5">
      <MessagePrimitive.Content components={{ Text: MarkdownText }} />
    </div>
    <AssistantActionBar />
    <BranchPicker className="col-start-2 row-start-2 -ml-2 mr-2" />
  </MessagePrimitive.Root>
);

const AssistantActionBar: FC = () => (
  <ActionBarPrimitive.Root
    hideWhenRunning autohide="not-last" autohideFloat="single-branch"
    className="text-muted-foreground flex gap-1 col-start-3 row-start-2 -ml-1 data-[floating]:bg-background data-[floating]:absolute data-[floating]:rounded-md data-[floating]:border data-[floating]:p-1 data-[floating]:shadow-sm"
  >
    <ActionBarPrimitive.Copy asChild>
      <TooltipIconButton tooltip="Copy">
        <MessagePrimitive.If copied><CheckIcon /></MessagePrimitive.If>
        <MessagePrimitive.If copied={false}><CopyIcon /></MessagePrimitive.If>
      </TooltipIconButton>
    </ActionBarPrimitive.Copy>
    <ActionBarPrimitive.Reload asChild>
      <TooltipIconButton tooltip="Refresh"><RefreshCwIcon /></TooltipIconButton>
    </ActionBarPrimitive.Reload>
  </ActionBarPrimitive.Root>
);

const BranchPicker: FC<BranchPickerPrimitive.Root.Props> = ({ className, ...rest }) => (
  <BranchPickerPrimitive.Root hideWhenSingleBranch className={cn("text-muted-foreground inline-flex items-center text-xs", className)} {...rest}>
    <BranchPickerPrimitive.Previous asChild><TooltipIconButton tooltip="Previous"><ChevronLeftIcon /></TooltipIconButton></BranchPickerPrimitive.Previous>
    <span className="font-medium"><BranchPickerPrimitive.Number /> / <BranchPickerPrimitive.Count /></span>
    <BranchPickerPrimitive.Next asChild><TooltipIconButton tooltip="Next"><ChevronRightIcon /></TooltipIconButton></BranchPickerPrimitive.Next>
  </BranchPickerPrimitive.Root>
);

const CircleStopIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" width="16" height="16">
    <rect width="10" height="10" x="3" y="3" rx="2" />
  </svg>
);
