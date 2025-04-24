
import { Zap, Highlighter, BookText } from "lucide-react";

const features = [
  {
    icon: <BookText size={24} className="text-purple-500" />,
    title: "AI Summarization",
    description: "Transform lengthy documents into concise, actionable summaries in seconds. Focus on what matters most without missing key information."
  },
  {
    icon: <Highlighter size={24} className="text-purple-500" />,
    title: "Smart Highlighting (Coming Soon)",
    description: "Our AI automatically identifies and highlights important concepts, facts, and insights across your documents. Never miss critical information again."
  },
  {
    icon: <Zap size={24} className="text-purple-500" />,
    title: "Contextual Explanations (Coming Soon)",
    description: "Get instant explanations of complex concepts within your notes. Simply select any text to receive clear, concise explanations."
  }
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 px-4 md:px-8 bg-white">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="gradient-text">Smart Features</span> for Your Notes
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            NoteGenius uses advanced AI to help you understand, organize, and master your content.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="feature-card group">
              <div className="mb-6 inline-block p-3 rounded-xl bg-purple-100 group-hover:bg-purple-200 transition-colors">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
