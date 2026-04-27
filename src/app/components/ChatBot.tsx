import { useState, useRef, useEffect } from "react";
import { Sparkles, X, Send, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Message {
  role: "user" | "assistant";
  text: string;
}

const FAQ_QUESTIONS = [
  "¿Cómo me inscribo a un curso?",
  "¿Qué son las gemas de aprendizaje?",
  "¿Cómo funciona el foro?",
  "¿Olvidé mi contraseña, qué hago?",
];

export function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [messages, open]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    setMessages((prev) => [...prev, { role: "user", text: text.trim() }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/v1/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text.trim() }),
      });
      const data = await res.json();
      const reply = res.ok
        ? data.reply
        : "Lo siento, ocurrió un error. Intenta de nuevo.";
      setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "No pude conectarme. Verifica tu conexión." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="w-[340px] sm:w-[370px] flex flex-col rounded-2xl overflow-hidden"
            style={{
              backgroundColor: "#FFFFFF",
              boxShadow:
                "0 8px 40px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.08)",
              border: "1px solid rgba(0,0,0,0.07)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3 shrink-0"
              style={{ backgroundColor: "#1C3A5C" }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: "#E5A800" }}
                >
                  <Sparkles size={15} color="#FFFFFF" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold leading-tight">
                    Romina
                  </p>
                  <p
                    className="text-xs leading-tight"
                    style={{ color: "rgba(255,255,255,0.55)" }}
                  >
                    Asistente Whirlpool Learning
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:bg-white/10"
              >
                <X size={15} color="white" />
              </button>
            </div>

            {/* Messages area */}
            <div
              className="flex flex-col gap-3 p-4 overflow-y-auto"
              style={{
                minHeight: 260,
                maxHeight: 360,
                backgroundColor: "#F4F6F9",
              }}
            >
              {messages.length === 0 && (
                <>
                  <div
                    className="self-start max-w-[88%] rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm leading-relaxed"
                    style={{ backgroundColor: "#FFFFFF", color: "#1A2332" }}
                  >
                    ¡Hola! Soy Romina, tu asistente de Whirlpool Learning.
                    ¿En qué puedo ayudarte? 👋
                  </div>

                  <p
                    className="text-xs text-center mt-1"
                    style={{ color: "#89B8D4" }}
                  >
                    Preguntas frecuentes
                  </p>

                  <div className="flex flex-col gap-1.5">
                    {FAQ_QUESTIONS.map((q) => (
                      <button
                        key={q}
                        onClick={() => sendMessage(q)}
                        className="text-left text-xs px-3 py-2 rounded-xl border transition-all hover:border-[#E5A800] hover:bg-[#E5A800]/5 active:scale-[0.98]"
                        style={{
                          borderColor: "rgba(0,0,0,0.12)",
                          color: "#1C3A5C",
                          backgroundColor: "#FFFFFF",
                        }}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.role === "user" ? "rounded-tr-sm" : "rounded-tl-sm"
                    }`}
                    style={{
                      backgroundColor:
                        msg.role === "user" ? "#1C3A5C" : "#FFFFFF",
                      color: msg.role === "user" ? "#FFFFFF" : "#1A2332",
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div
                    className="rounded-2xl rounded-tl-sm px-4 py-3"
                    style={{ backgroundColor: "#FFFFFF" }}
                  >
                    <div className="flex gap-1 items-center">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: "#89B8D4" }}
                          animate={{ y: [0, -4, 0] }}
                          transition={{
                            duration: 0.55,
                            repeat: Infinity,
                            delay: i * 0.12,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-2 px-3 py-3 border-t shrink-0"
              style={{
                borderColor: "rgba(0,0,0,0.08)",
                backgroundColor: "#FFFFFF",
              }}
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe tu pregunta..."
                disabled={loading}
                autoComplete="off"
                className="flex-1 text-sm outline-none bg-transparent placeholder:text-gray-400 disabled:opacity-60"
                style={{ color: "#1A2332" }}
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all disabled:opacity-40 active:scale-95"
                style={{ backgroundColor: "#E5A800" }}
              >
                <Send size={14} color="white" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating bubble button */}
      <motion.button
        onClick={() => setOpen((v) => !v)}
        className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
        style={{ backgroundColor: "#1C3A5C" }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        aria-label="Abrir asistente Romina"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <ChevronDown size={22} color="white" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Sparkles size={22} color="#E5A800" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
