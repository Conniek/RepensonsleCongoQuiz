"use client";

import {
  BookOpen,
  Globe,
  Music,
  Leaf,
  TrendingUp,
} from "lucide-react";

type CategoryIcon = {
  nom: string;
  icon: React.ComponentType<{ size: number; className: string }>;
  color: string;
  bgColor: string;
};

const iconMap: CategoryIcon[] = [
  {
    nom: "Histoire",
    icon: BookOpen,
    color: "var(--rouge)",
    bgColor: "rgba(163, 43, 30, 0.1)",
  },
  {
    nom: "Géographie",
    icon: Globe,
    color: "var(--vert)",
    bgColor: "rgba(47, 93, 69, 0.1)",
  },
  {
    nom: "Musique",
    icon: Music,
    color: "var(--ocre)",
    bgColor: "rgba(227, 167, 47, 0.1)",
  },
  {
    nom: "Nature",
    icon: Leaf,
    color: "var(--bleu)",
    bgColor: "rgba(23, 73, 124, 0.1)",
  },
  {
    nom: "Économie et plus",
    icon: TrendingUp,
    color: "#7c3fa8",
    bgColor: "rgba(124, 63, 168, 0.1)",
  },
];

export default function CategoriesGrid() {
  return (
    <div className="categories-grid">
      {iconMap.map((category) => {
        const Icon = category.icon;
        return (
          <div key={category.nom} className="category-card">
            <div
              className="category-icon-wrapper"
              style={{ backgroundColor: category.bgColor }}
            >
              <Icon size={32} style={{ color: category.color }} className="category-icon" />
            </div>
            <p className="category-name">{category.nom}</p>
          </div>
        );
      })}
    </div>
  );
}