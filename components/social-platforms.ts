import { BookOpen, Facebook, Instagram, Linkedin } from "lucide-react";
import type { ComponentType } from "react";
import { HuggingFaceIcon, XIcon } from "@/components/icons";
import type { SocialLinks } from "@/lib/site-data";

interface SocialPlatform {
  key: keyof SocialLinks;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

export const socialPlatforms: SocialPlatform[] = [
  { key: "facebook", label: "Facebook", icon: Facebook },
  { key: "instagram", label: "Instagram", icon: Instagram },
  { key: "blog", label: "Blog", icon: BookOpen },
  { key: "x", label: "X", icon: XIcon },
  { key: "linkedin", label: "LinkedIn", icon: Linkedin },
  { key: "huggingface", label: "Hugging Face", icon: HuggingFaceIcon },
];
