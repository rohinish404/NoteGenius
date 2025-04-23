"use client"
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CTASection() {
  return (
    <section className="py-20 px-4 md:px-8 bg-white border-t"> 
      <div className="container mx-auto max-w-5xl text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Ready to <span className="gradient-text">Transform Your Notes</span>?
        </h2>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-8">
          Join thousands of students, researchers, and professionals who are saving time and gaining deeper insights with NoteGenius.
        </p>
        <Button className="bg-purple-500 hover:bg-purple-600 text-white px-10 py-4 text-xl h-auto rounded-lg"> 
          <Link href="/dashboard">Try NoteGenius Now</Link>
        </Button>
      </div>
    </section>
  );
}