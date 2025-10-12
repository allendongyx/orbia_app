"use client";

import Link from "next/link";
import Image from "next/image";
import { Bell, HelpCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-sm">
      <div className="flex h-16 items-center px-6">
        {/* Logo Section */}
        <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="relative h-8 w-8">
            <Image
              src="/single_logo.png"
              alt="Orbia Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <span className="text-xl font-bold text-gray-900">Orbia</span>
        </Link>

        {/* Right Section */}
        <div className="ml-auto flex items-center gap-3">
          {/* Help Button */}
          <Link
            href="https://orbia.gitbook.io/orbia-docs"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button 
              variant="ghost" 
              size="icon"
              className="h-9 w-9 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <HelpCircle className="h-5 w-5" />
            </Button>
          </Link>
          
          <Separator orientation="vertical" className="h-6 bg-gray-200" />

          {/* Notification Button */}
          <div className="relative">
            <Button 
              variant="ghost" 
              size="icon"
              className="h-9 w-9 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <Bell className="h-5 w-5" />
            </Button>
            <Badge 
              variant="destructive" 
              className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]"
            >
              3
            </Badge>
          </div>

          <Separator orientation="vertical" className="h-6 bg-gray-200" />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="gap-2 h-9 px-3 hover:bg-gray-100"
              >
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-blue-700 text-white text-xs font-medium">
                    AD
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:inline text-sm font-medium text-gray-700">
                  allendongxy@gmail.com
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium text-gray-900">
                    Allen Dong
                  </p>
                  <p className="text-xs text-gray-500">
                    allendongxy@gmail.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="font-normal text-xs text-gray-500">
                ID: 17849217429
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

