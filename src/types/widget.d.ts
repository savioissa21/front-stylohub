export type WidgetType =
  | "LINK"
  | "YOUTUBE"       // was "VIDEO" — fixed to match backend enum
  | "SPOTIFY"
  | "IMAGE"
  | "LEAD_FORM"
  | "TEXT"
  | "TIKTOK"
  | "TWITCH"
  | "SOUNDCLOUD"
  | "TWITTER"
  | "DONATION_LINK"
  | "PIX"
  | "AFFILIATE_LINK";

export interface Widget {
  id: string;
  type: WidgetType;
  orderIndex: number;
  isActive: boolean;
  config: WidgetConfig;
}

export interface WidgetConfig {
  thumbnail?: string;
  iconName?: string;
  animation?: "none" | "pulse" | "shake" | "bounce";
  schedule?: {
    startDate?: string;
    endDate?: string;
  };
  // LINK
  title?: string;
  url?: string;
  // YOUTUBE
  videoId?: string;
  autoPlay?: boolean;
  showControls?: boolean;
  // SPOTIFY
  spotifyUri?: string;
  compact?: boolean;
  // IMAGE
  imageUrl?: string;
  altText?: string;
  linkUrl?: string;
  // LEAD_FORM
  content?: string;
  buttonLabel?: string;
  successMessage?: string;
  formFields?: string[];
  // TEXT
  text?: string;
  // TWITCH
  channel?: string;
  clipSlug?: string;
  isClip?: boolean;
  // SOUNDCLOUD
  trackUrl?: string;
  // TWITTER
  tweetId?: string;
  // DONATION_LINK
  platform?: "KOFI" | "BUYMEACOFFEE" | "PAYPAL" | "OUTRO";
  // PIX
  pixKey?: string;
  pixKeyType?: "CPF" | "CNPJ" | "EMAIL" | "TELEFONE" | "ALEATORIA";
  description?: string;
  // AFFILIATE_LINK
  code?: string;
}

export interface AddWidgetRequest {
  type: WidgetType;
  order: number;
  thumbnail?: string;
  iconName?: string;
  animation?: "none" | "pulse" | "shake" | "bounce";
  schedule?: {
    startDate?: string;
    endDate?: string;
  };
  title?: string;
  url?: string;
  videoId?: string;
  autoPlay?: boolean;
  showControls?: boolean;
  spotifyUri?: string;
  compact?: boolean;
  imageUrl?: string;
  altText?: string;
  linkUrl?: string;
  content?: string;
  buttonLabel?: string;
  successMessage?: string;
  formFields?: string[];
  text?: string;
  twitchChannel?: string;
  twitchClipSlug?: string;
  twitterTweetId?: string;
  donationPlatform?: "KOFI" | "BUYMEACOFFEE" | "PAYPAL" | "OUTRO";
  pixKey?: string;
  pixKeyType?: "CPF" | "CNPJ" | "EMAIL" | "TELEFONE" | "ALEATORIA";
}

export interface UpdateWidgetRequest extends Omit<AddWidgetRequest, "type" | "order"> {}

export interface ReorderWidgetsRequest {
  orderedWidgetIds: string[];
}
