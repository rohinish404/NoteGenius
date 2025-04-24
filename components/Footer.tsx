export default function Footer() {
    return (
      <footer className="bg-gray-900 py-12 px-4 md:px-8 text-gray-300 w-full"> 
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold text-sm">N</div>
                <span className="text-lg font-bold text-white">NoteGenius</span> 
              </div>
              <p className="text-sm text-gray-400">AI-powered notes. Smarter insights.</p> 
            </div>
            
            <div className="flex flex-col md:flex-row gap-8 md:gap-16"> 
              <div>

                <h4 className="font-semibold mb-3 text-white">Features</h4> 
                <ul className="space-y-2">
                  <li>AI Summarization</li>
                  <li>Smart Highlighting (Coming Soon)</li>
                  <li>Contextual Explanations (Coming Soon)</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3 text-white">Company</h4>
                <ul className="space-y-2">
                  <li>About</li>
                  <li>Privacy Policy</li>
                  <li>Terms of Service</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-10 pt-6 text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} NoteGenius. All rights reserved.
          </div>
        </div>
      </footer>
    );
  }