import React from "react";
import Link from "next/link";
import { Button } from "@/components/common/Button";
import { SearchX, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="py-16 text-center max-w-md mx-auto space-y-6">
      <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
        <SearchX className="w-10 h-10 text-[#00A896]" />
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-black text-slate-900">Page Not Found</h1>
        <p className="text-sm text-slate-500">
          The advertisement, category, or page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <Link href="/" className="w-full sm:w-auto">
          <Button variant="primary" leftIcon={<Home className="w-4 h-4" />} className="w-full">
            Back to Homepage
          </Button>
        </Link>
        <Link href="/search" className="w-full sm:w-auto">
          <Button variant="outline" leftIcon={<Search className="w-4 h-4" />} className="w-full">
            Browse All Ads
          </Button>
        </Link>
      </div>
    </div>
  );
}
