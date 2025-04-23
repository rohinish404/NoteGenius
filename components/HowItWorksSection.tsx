
export default function HowItWorksSection() {
    return (
      <section id="how-it-works" className="py-20 px-4 md:px-8 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How <span className="gradient-text">NoteGenius</span> Works
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Get started in seconds with our simple three-step process
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-purple-100 text-purple-500 flex items-center justify-center text-2xl font-bold mx-auto mb-6">1</div>
              <h3 className="text-xl font-bold mb-3">Paste Your Content</h3>
              <p className="text-gray-600">Simply paste any text, article, or notes you need to work with.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-purple-100 text-purple-500 flex items-center justify-center text-2xl font-bold mx-auto mb-6">2</div>
              <h3 className="text-xl font-bold mb-3">Select AI Action</h3>
              <p className="text-gray-600">Choose whether you want to summarize, highlight important points, or explain concepts.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-purple-100 text-purple-500 flex items-center justify-center text-2xl font-bold mx-auto mb-6">3</div>
              <h3 className="text-xl font-bold mb-3">Get Instant Results</h3>
              <p className="text-gray-600">Within seconds, NoteGenius delivers AI-powered insights tailored to your needs.</p>
            </div>
          </div>
        </div>
      </section>
    );
  }
  