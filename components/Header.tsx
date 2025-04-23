"use client"
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full py-4 px-4 md:px-8 flex justify-between items-center bg-white/80 backdrop-blur-sm sticky top-0 z-50 border-b">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold text-xl">N</div>
        <span className="text-xl font-bold">NoteGenius</span>
      </div>
      <nav className="hidden md:flex gap-8 font-medium text-gray-600">
        <a href="#features" className="hover:text-purple-500 transition-colors">Features</a>
        <a href="#how-it-works" className="hover:text-purple-500 transition-colors">How it works</a>
      </nav>
      <Button asChild className="bg-purple-500 hover:bg-purple-600">
        <Link href="/dashboard">Try it out</Link>
      </Button>
    </header>
  );
}