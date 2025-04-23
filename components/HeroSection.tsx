"use client"
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="hero-gradient py-16 md:py-24 px-4 md:px-8 overflow-hidden">
      <div className="container mx-auto max-w-6xl flex flex-col md:flex-row items-center gap-10 md:gap-20">
        <div className="flex-1 space-y-6 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            Transform Your Notes with <span className="gradient-text">AI Intelligence</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto md:mx-0">
            NoteGenius helps you summarize, highlight, and explain your notes with the power of artificial intelligence. Save time and gain deeper insights instantly.
          </p>
          <div className="pt-4 flex gap-4 justify-center md:justify-start">
            <Button className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-3 text-lg h-auto">
              <Link href="/dashboard">Try NoteGenius Now</Link>
            </Button>
          </div>
        </div>

        <div className="flex-1 relative mt-12 md:mt-0">
          <div className="w-full h-[350px] md:h-[400px] relative">
            <div className="absolute right-0 top-0 md:top-10 w-[250px] md:w-[320px] h-auto bg-white rounded-lg shadow-xl p-4 animate-float" style={{ animationDelay: '0.2s' }}>
              <div className="h-4 w-2/3 bg-purple-200 rounded mb-3"></div>
              <div className="h-3 w-full bg-gray-100 rounded mb-2"></div>
              <div className="h-3 w-full bg-gray-100 rounded mb-2"></div>
              <div className="h-3 w-full bg-gray-100 rounded mb-2"></div>
              <div className="h-3 w-3/4 bg-gray-100 rounded mb-4"></div>
              <div className="h-8 w-full bg-purple-100 rounded flex items-center px-3">
                <div className="h-3 w-5/6 bg-purple-300 rounded"></div>
              </div>
            </div>

            <div className="absolute left-0 bottom-0 md:bottom-10 w-[250px] md:w-[320px] h-auto bg-white rounded-lg shadow-xl p-4 animate-float" style={{ animationDelay: '0.5s' }}>
              <div className="h-4 w-1/2 bg-purple-200 rounded mb-3"></div>
              <div className="space-y-2">
                <div className="flex gap-2 items-center">
                  <div className="h-6 w-6 bg-purple-400 rounded-full"></div> 
                  <div className="h-3 w-5/6 bg-gray-100 rounded"></div>
                </div>
                <div className="flex gap-2 items-center">
                  <div className="h-6 w-6 bg-purple-400 rounded-full"></div> 
                  <div className="h-3 w-4/6 bg-gray-100 rounded"></div>
                </div>
                <div className="flex gap-2 items-center">
                  <div className="h-6 w-6 bg-purple-400 rounded-full"></div>
                  <div className="h-3 w-5/6 bg-gray-100 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}