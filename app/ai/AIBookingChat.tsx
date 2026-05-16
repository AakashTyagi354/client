"use client";

// ─────────────────────────────────────────────────────────────────────────────
// AI Booking Chat
//
// Chat interface for the MCP booking agent.
// Handles multi-turn conversation and Razorpay payment trigger.
//
// Flow:
//   User → agent/chat → agent searches doctors + slots
//   Agent returns PAYMENT_REQUIRED → frontend triggers Razorpay
//   Payment success → webhook → appointment created
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { selectToken } from "@/redux/userSlice";
import axiosInstance from "@/app/login/axiosInstance";
import { Sparkles, Send, Loader2, User, Bot, X } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface AgentResponse {
  message: string;
  actionTaken: boolean;
  actionType: string;
  razorpayOrderId?: string;
  amount?: number;
  doctorId?: number;
  slotId?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// RAZORPAY LOADER
// ─────────────────────────────────────────────────────────────────────────────

const loadRazorpay = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function AIBookingChat() {
  const token = useSelector(selectToken);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // conversationHistory sent to backend — keeps full context
  const historyRef = useRef<{ role: string; content: string }[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ─────────────────────────────────────────────────────────────────────────
  // SEND MESSAGE
  // ─────────────────────────────────────────────────────────────────────────

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");

    // Add to UI
    setMessages((prev) => [
      ...prev,
      { role: "user", content: userMessage },
    ]);

    setLoading(true);

    try {
      const res = await axiosInstance.post(
        "http://localhost:8089/api/v1/ai/agent/chat",
        {
          message: userMessage,
          conversationHistory: historyRef.current,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const agentData: AgentResponse = res.data.data;

      // Add assistant response to UI
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: agentData.message },
      ]);

      // Update conversation history for next turn
      historyRef.current = [
        ...historyRef.current,
        { role: "user", content: userMessage },
        { role: "assistant", content: agentData.message },
      ];

      // Handle payment required
      if (agentData.actionType === "PAYMENT_REQUIRED"
          && agentData.razorpayOrderId) {
        await triggerRazorpay(agentData);
      }

    } catch (err) {
      console.error("Agent error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // TRIGGER RAZORPAY
  // ─────────────────────────────────────────────────────────────────────────

  const triggerRazorpay = async (agentData: AgentResponse) => {
    const loaded = await loadRazorpay();
    if (!loaded) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Payment service unavailable. Please try again.",
        },
      ]);
      return;
    }

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: agentData.amount,
      currency: "INR",
      order_id: agentData.razorpayOrderId,
      name: "Delma Health",
      description: "Doctor Appointment Booking",
      handler: (response: any) => {
        // Payment success — webhook handles appointment creation
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "✅ Payment successful! Your appointment has been confirmed. " +
              "You can view it in the Appointments section.",
          },
        ]);
        // Reset conversation after successful booking
        historyRef.current = [];
      },
      modal: {
        ondismiss: () => {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content:
                "Payment was cancelled. " +
                "Would you like to try again?",
            },
          ]);
        },
      },
      theme: { color: "#78355b" },
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  };

  // ─────────────────────────────────────────────────────────────────────────
  // CLEAR CHAT
  // ─────────────────────────────────────────────────────────────────────────

  const clearChat = () => {
    setMessages([]);
    historyRef.current = [];
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-[#78355b] rounded-full
                     shadow-lg flex items-center justify-center hover:bg-[#6a2d50]
                     transition-all z-50"
        >
          <Sparkles size={22} className="text-white" />
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[380px] h-[520px] bg-white
                        rounded-2xl shadow-2xl border border-gray-100 flex
                        flex-col z-50 overflow-hidden">

          {/* Header */}
          <div className="flex items-center gap-2 px-4 py-3 bg-[#78355b]">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center
                            justify-center flex-shrink-0">
              <Sparkles size={15} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">
                AI Booking Assistant
              </p>
              <p className="text-[11px] text-white/70">
                Book appointments with AI
              </p>
            </div>
            <button
              onClick={clearChat}
              className="text-white/60 hover:text-white text-xs mr-2"
            >
              Clear
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/60 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">

            {/* Welcome message */}
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center
                              h-full text-center px-4">
                <div className="w-12 h-12 rounded-2xl bg-[#78355b]/10
                                flex items-center justify-center mb-3">
                  <Sparkles size={20} className="text-[#78355b]" />
                </div>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  AI Booking Assistant
                </p>
                <p className="text-xs text-gray-400 mb-4">
                  I can help you find doctors and book appointments
                </p>
                {/* Quick prompts */}
                {[
                  "Find a cardiologist",
                  "Show my appointments",
                  "Book a dermatologist for tomorrow",
                ].map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => {
                      setInput(prompt);
                    }}
                    className="w-full text-left text-xs bg-white border
                               border-gray-200 rounded-xl px-3 py-2 mb-2
                               hover:border-[#78355b] hover:text-[#78355b]
                               transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {/* Chat messages */}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2 ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="w-6 h-6 rounded-full bg-[#78355b] flex
                                  items-center justify-center flex-shrink-0
                                  mt-0.5">
                    <Bot size={12} className="text-white" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm
                              leading-relaxed whitespace-pre-wrap
                              ${msg.role === "user"
                                ? "bg-[#78355b] text-white rounded-tr-sm"
                                : "bg-white text-gray-700 shadow-sm rounded-tl-sm"
                              }`}
                >
                  {msg.content}
                </div>

                {msg.role === "user" && (
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex
                                  items-center justify-center flex-shrink-0
                                  mt-0.5">
                    <User size={12} className="text-gray-500" />
                  </div>
                )}
              </div>
            ))}

            {/* Loading indicator */}
            {loading && (
              <div className="flex gap-2 justify-start">
                <div className="w-6 h-6 rounded-full bg-[#78355b] flex
                                items-center justify-center flex-shrink-0">
                  <Bot size={12} className="text-white" />
                </div>
                <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm
                                shadow-sm">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-[#78355b] rounded-full
                                     animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-[#78355b] rounded-full
                                     animate-bounce [animation-delay:0.15s]" />
                    <span className="w-1.5 h-1.5 bg-[#78355b] rounded-full
                                     animate-bounce [animation-delay:0.3s]" />
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-3 border-t border-gray-100 bg-white
                          flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey
                && sendMessage()}
              placeholder="Ask me to book an appointment..."
              className="flex-1 text-sm border border-gray-200 rounded-xl
                         px-3 py-2 focus:outline-none focus:border-[#78355b]
                         bg-gray-50"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="w-9 h-9 bg-[#78355b] rounded-xl flex items-center
                         justify-center hover:bg-[#6a2d50] transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed
                         flex-shrink-0"
            >
              {loading
                ? <Loader2 size={15} className="text-white animate-spin" />
                : <Send size={15} className="text-white" />
              }
            </button>
          </div>
        </div>
      )}
    </>
  );
}