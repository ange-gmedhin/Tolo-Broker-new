export interface PhoneListing {
  id: string;
  userId: number;
  sellerName: string;
  phoneModel: string;
  description: string;
  price: string;
  currency: string;
  photoUrl: string;
  photoFileId: string;
  sellerPhone: string;
  sellerUsername?: string;
  createdAt: string;
  status: 'active' | 'sold';
}

export type ConversationState =
  | 'IDLE'
  | 'AWAITING_MODEL'
  | 'AWAITING_DESCRIPTION'
  | 'AWAITING_PRICE'
  | 'AWAITING_PHOTO'
  | 'AWAITING_PHONE'
  | 'CONFIRMING';

export interface TelegramMessage {
  id: string;
  sender: 'bot' | 'user';
  text?: string;
  photoUrl?: string;
  replyMarkup?: {
    inlineKeyboard?: Array<Array<{ text: string; callbackData?: string; url?: string }>>;
    keyboard?: Array<Array<{ text: string; requestContact?: boolean }>>;
  };
  timestamp: string;
}
