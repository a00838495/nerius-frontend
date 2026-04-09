export interface GemCategory {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
}

export interface GemTag {
  id: string;
  name: string;
}

export interface GemCreator {
  id: string;
  first_name: string;
  last_name: string;
}

export interface GemArea {
  id: string;
  name: string;
}

export interface GemCard {
  id: string;
  title: string;
  description: string | null;
  icon_url: string | null;
  gemini_url: string | null;
  visibility: string;
  is_featured: boolean;
  status: string;
  saves_count: number;
  created_at: string;
  category: GemCategory | null;
  area: GemArea | null;
  created_by_user: GemCreator;
  tags: GemTag[];
  is_saved: boolean;
}

export interface GemDetail extends GemCard {
  instructions: string;
  conversation_starters: string[] | null;
  updated_at: string;
  areas: GemArea[];
}

export interface UserGemCollectionEntry {
  id: string;
  gem: GemCard;
  saved_at: string;
  notes: string | null;
}
